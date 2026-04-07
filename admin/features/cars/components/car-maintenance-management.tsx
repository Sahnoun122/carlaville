'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  Wrench, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Banknote, 
  ClipboardList,
  Building,
  Car as CarIcon,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { AvailabilityStatus, Car, MaintenanceRecord } from '@/types';
import {
  completeCarMaintenance,
  getCarMaintenanceHistory,
  getCars,
  startCarMaintenance,
} from '@/features/cars/services/car-service';
import { cn } from '@/lib/utils';

const resolveCarId = (car: Car) =>
  car.id || (car as Car & { _id?: string })._id || '';

const resolveAgencyName = (car: Car) => {
  const agencyFromCar = car as unknown as {
    agencyId?: unknown;
    agency?: { name?: string };
  };

  if (agencyFromCar.agency?.name) {
    return agencyFromCar.agency.name;
  }

  if (agencyFromCar.agencyId && typeof agencyFromCar.agencyId === 'object') {
    const populatedAgency = agencyFromCar.agencyId as { name?: string };
    if (populatedAgency.name) {
      return populatedAgency.name;
    }
  }

  return 'Aucune agence';
};

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  [AvailabilityStatus.AVAILABLE]: { label: 'Disponible', class: 'border-emerald-200 bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  [AvailabilityStatus.UNAVAILABLE]: { label: 'Indisponible', class: 'border-slate-200 bg-slate-50 text-slate-500', icon: AlertCircle },
  [AvailabilityStatus.MAINTENANCE]: { label: 'En Maintenance', class: 'border-amber-200 bg-amber-50 text-amber-700', icon: Wrench },
  [AvailabilityStatus.RENTED]: { label: 'Louée', class: 'border-blue-200 bg-blue-50 text-blue-700', icon: CarIcon },
};

interface CarMaintenanceManagementProps {
  readOnly?: boolean;
}

export const CarMaintenanceManagement = ({
  readOnly = false,
}: CarMaintenanceManagementProps) => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | ''>('');
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState<'start' | 'complete'>('start');
  const [maintenanceCar, setMaintenanceCar] = useState<Car | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [maintenanceVehicleCondition, setMaintenanceVehicleCondition] = useState('');
  const [maintenanceCost, setMaintenanceCost] = useState('');
  const [maintenanceNextStatus, setMaintenanceNextStatus] = useState<AvailabilityStatus>(AvailabilityStatus.AVAILABLE);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyCarLabel, setHistoryCarLabel] = useState('');
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceRecord[]>([]);

  const carsQuery = useQuery({
    queryKey: ['cars', 'maintenance', page],
    queryFn: () => getCars({ page, limit: 50 }),
  });

  const startMaintenanceMutation = useMutation({
    mutationFn: startCarMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsMaintenanceModalOpen(false);
      toast.success('Maintenance démarrée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec du démarrage.');
    },
  });

  const completeMaintenanceMutation = useMutation({
    mutationFn: completeCarMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsMaintenanceModalOpen(false);
      toast.success('Maintenance terminée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la clôture.');
    },
  });

  const handleOpenStartMaintenance = (car: Car) => {
    setMaintenanceCar(car);
    setMaintenanceMode('start');
    setMaintenanceReason('');
    setMaintenanceNotes('');
    setMaintenanceVehicleCondition('');
    setMaintenanceCost('');
    setMaintenanceNextStatus(AvailabilityStatus.AVAILABLE);
    setIsMaintenanceModalOpen(true);
  };

  const handleOpenCompleteMaintenance = (car: Car) => {
    setMaintenanceCar(car);
    setMaintenanceMode('complete');
    setMaintenanceReason('');
    setMaintenanceNotes('');
    setMaintenanceVehicleCondition('');
    setMaintenanceCost('');
    setMaintenanceNextStatus(AvailabilityStatus.AVAILABLE);
    setIsMaintenanceModalOpen(true);
  };

  const handleViewMaintenanceHistory = async (car: Car) => {
    const carId = resolveCarId(car);
    if (!carId) return;

    try {
      const response = await getCarMaintenanceHistory(carId);
      setHistoryCarLabel(response.carLabel);
      setMaintenanceHistory(response.history);
      setIsHistoryModalOpen(true);
    } catch {
      toast.error('Échec du chargement de l\'historique.');
    }
  };

  const handleSubmitMaintenance = () => {
    const carId = maintenanceCar ? resolveCarId(maintenanceCar) : '';
    if (!carId) return;

    if (maintenanceMode === 'start') {
      if (!maintenanceReason.trim()) {
        toast.error('Motif requis');
        return;
      }

      startMaintenanceMutation.mutate({
        id: carId,
        reason: maintenanceReason.trim(),
        notes: maintenanceNotes.trim() || undefined,
        vehicleCondition: maintenanceVehicleCondition.trim() || undefined,
        estimatedCost: maintenanceCost.trim().length > 0 ? Number(maintenanceCost) : undefined,
      });
      return;
    }

    completeMaintenanceMutation.mutate({
      id: carId,
      notes: maintenanceNotes.trim() || undefined,
      vehicleCondition: maintenanceVehicleCondition.trim() || undefined,
      finalCost: maintenanceCost.trim().length > 0 ? Number(maintenanceCost) : undefined,
      nextAvailabilityStatus: maintenanceNextStatus,
    });
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-600">
               <Wrench size={24} />
            </div>
            <div>
               <h2 className="text-lg font-black text-slate-900 leading-tight">État de la Flotte</h2>
               <p className="text-xs font-bold text-slate-400">Gérez les interventions techniques et l'historique.</p>
            </div>
         </div>
         <Button
            variant="outline"
            onClick={() => carsQuery.refetch()}
            disabled={carsQuery.isRefetching}
            className="h-12 w-12 rounded-2xl p-0 hover:bg-slate-50 transition-all border-slate-200"
          >
            <RefreshCcw size={18} className={cn(carsQuery.isRefetching && "animate-spin", "text-slate-500")} />
          </Button>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
              <input
                type="text"
                placeholder="Rechercher par marque, modèle ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AvailabilityStatus | '')}
                className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50 appearance-none font-medium"
              >
                <option value="">Tous les statuts</option>
                <option value={AvailabilityStatus.AVAILABLE}>Disponible</option>
                <option value={AvailabilityStatus.MAINTENANCE}>En Maintenance</option>
                <option value={AvailabilityStatus.RENTED}>Louée</option>
                <option value={AvailabilityStatus.UNAVAILABLE}>Indisponible</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {carsQuery.isLoading && !carsQuery.isRefetching ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
             <RefreshCcw className="w-8 h-8 animate-spin text-slate-200" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Synchronisation...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50/50 text-left">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Véhicule / Localisation</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Agence</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut Flotte</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {carsQuery.data?.cars
                  .filter((car) => {
                    const searchLower = searchTerm.toLowerCase();
                    const matchesSearch =
                      car.brand.toLowerCase().includes(searchLower) ||
                      car.model.toLowerCase().includes(searchLower) ||
                      car.city.toLowerCase().includes(searchLower);
                    
                    const matchesStatus = statusFilter === '' || car.availabilityStatus === statusFilter;
                    
                    return matchesSearch && matchesStatus;
                  })
                  .map((car) => {
                  const carId = resolveCarId(car);
                  const status = statusConfig[car.availabilityStatus] || { label: car.availabilityStatus, class: 'bg-slate-100 text-slate-600', icon: AlertCircle };
                  return (
                    <tr key={carId} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-3">
                           <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 shrink-0 transition-all group-hover:bg-red-50 group-hover:text-red-600">
                              <CarIcon size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900 leading-tight">{car.brand} {car.model}</span>
                              <span className="text-[10px] font-bold text-slate-400">{car.year} • {car.city}</span>
                           </div>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2">
                            <Building size={14} className="text-slate-300" />
                            <span className="text-xs font-bold text-slate-700">{resolveAgencyName(car)}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <span className={cn(
                           "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-tight",
                           status.class
                         )}>
                            <status.icon size={12} />
                            {status.label}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex justify-end gap-2">
                            {!readOnly && (
                              car.availabilityStatus === AvailabilityStatus.MAINTENANCE ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleOpenCompleteMaintenance(car)}
                                  className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-lg shadow-emerald-100"
                                >
                                  Clôturer
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenStartMaintenance(car)}
                                  className="h-9 px-4 rounded-lg border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all font-bold"
                                >
                                  Réparer
                                </Button>
                              )
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewMaintenanceHistory(car)}
                              className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                            >
                               <History size={14} className="mr-1.5" />
                               Historique
                            </Button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
                {carsQuery.data?.cars.filter((car) => {
                  const searchLower = searchTerm.toLowerCase();
                  const matchesSearch =
                    car.brand.toLowerCase().includes(searchLower) ||
                    car.model.toLowerCase().includes(searchLower) ||
                    car.city.toLowerCase().includes(searchLower);
                  
                  const matchesStatus = statusFilter === '' || car.availabilityStatus === statusFilter;
                  
                  return matchesSearch && matchesStatus;
                }).length === 0 && carsQuery.data?.cars.length !== 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="text-sm font-medium text-slate-500">
                        Aucun véhicule trouvé {searchTerm && `pour "${searchTerm}"`}{searchTerm && statusFilter && ' avec '}{statusFilter && `le statut "${statusConfig[statusFilter]?.label}"`}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {carsQuery.data?.cars.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center gap-3">
                <CarIcon className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-medium text-slate-500">Aucun véhicule disponible</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title={maintenanceMode === 'start' ? 'Planifier Maintenance' : 'Rapport de Clôture'}
        contentClassName="max-w-2xl rounded-[2.5rem]"
      >
        <div className="space-y-6 p-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif / Nature</label>
                 <div className="relative group">
                    <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500" />
                    <input
                      value={maintenanceReason}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      placeholder="Ex: Vidange, Révision..."
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold"
                      disabled={maintenanceMode === 'complete'}
                    />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {maintenanceMode === 'start' ? 'Coût Estimé (MAD)' : 'Coût Final (MAD)'}
                 </label>
                 <div className="relative group">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-red-500" />
                    <input
                      type="number"
                      value={maintenanceCost}
                      onChange={(e) => setMaintenanceCost(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold"
                    />
                 </div>
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">État du Véhicule</label>
              <div className="relative group">
                 <ClipboardList className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-red-500" />
                 <textarea
                   value={maintenanceVehicleCondition}
                   onChange={(e) => setMaintenanceVehicleCondition(e.target.value)}
                   placeholder="Détails techniques..."
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-medium min-h-[100px]"
                 />
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes Internes</label>
              <textarea
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-medium min-h-[80px]"
              />
           </div>

           {maintenanceMode === 'complete' && (
             <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remise en Circulation</label>
                <select
                  value={maintenanceNextStatus}
                  onChange={(e) => setMaintenanceNextStatus(e.target.value as AvailabilityStatus)}
                  className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl font-bold appearance-none"
                >
                  <option value={AvailabilityStatus.AVAILABLE}>Disponible immédiatement</option>
                  <option value={AvailabilityStatus.UNAVAILABLE}>Indisponible (Stock)</option>
                </select>
             </div>
           )}
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
           <Button variant="outline" onClick={() => setIsMaintenanceModalOpen(false)} className="h-12 px-8 rounded-xl font-bold border-none hover:bg-slate-100">Annuler</Button>
           <Button 
              onClick={handleSubmitMaintenance} 
              disabled={startMaintenanceMutation.isPending || completeMaintenanceMutation.isPending}
              className="h-12 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl"
           >
             {maintenanceMode === 'start' ? 'Démarrer l\'intervention' : 'Valider la sortie'}
           </Button>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={historyCarLabel}
        contentClassName="max-w-3xl rounded-[2.5rem]"
      >
        <div className="p-2">
           <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-red-600" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Historique des Interventions</h3>
           </div>

           {maintenanceHistory.length === 0 ? (
             <div className="p-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-400">Aucune intervention enregistrée.</p>
             </div>
           ) : (
             <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
               {maintenanceHistory.map((record, index) => (
                 <div key={index} className="group relative flex gap-6 p-6 rounded-3xl bg-white border border-slate-100 transition-all hover:shadow-lg hover:border-red-100">
                    <div className="flex flex-col items-center">
                       <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                          <Wrench size={18} />
                       </div>
                       <div className="flex-1 w-px bg-slate-100 my-2" />
                    </div>
                    <div className="flex-1 space-y-3">
                       <div className="flex justify-between items-start">
                          <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{record.reason}</h4>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                             {new Date(record.startedAt).toLocaleDateString()}
                          </span>
                       </div>
                       
                       <p className="text-sm text-slate-600 font-medium leading-relaxed">{record.notes || "Pas de remarques particulières."}</p>
                       
                       <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="flex items-center gap-2">
                             <Banknote size={14} className="text-emerald-500" />
                             <span className="text-xs font-black text-slate-900">{record.finalCost || record.estimatedCost || 0} MAD</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <CheckCircle2 size={14} className="text-blue-500" />
                             <span className="text-xs font-bold text-slate-500">Terminée le {record.endedAt ? new Date(record.endedAt).toLocaleDateString() : 'N/A'}</span>
                          </div>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </Modal>
    </div>
  );
};
