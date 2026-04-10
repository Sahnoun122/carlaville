'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCar,
  deleteCar,
  getCars,
  updateCar,
  type CarFormValues,
} from '@/features/cars/services/car-service';
import { CarForm } from './car-form';
import { CarDetails } from './car-details';
import { getAgencies } from '@/features/agencies/services/agency-service';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Car, Agency } from '@/types';
import { Plus, Search, Car as CarIcon, RefreshCcw, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminCarCard } from './car-card';

const resolveCarId = (car: Car | null | undefined) =>
  car?.id || (car as any)?._id || (car as any)?.carId || '';

const resolveAgencyId = (car: Car) => {
  const rawAgencyId = (car as unknown as { agencyId?: unknown }).agencyId;
  if (!rawAgencyId) return '';
  if (typeof rawAgencyId === 'string') return rawAgencyId;
  const populatedAgency = rawAgencyId as { id?: string; _id?: string };
  return populatedAgency.id || populatedAgency._id || '';
};

export const CarManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgency, setFilterAgency] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [viewingCar, setViewingCar] = useState<Car | null>(null);

  const carsQuery = useQuery({
    queryKey: ['cars', page, searchTerm, filterAgency],
    queryFn: () => getCars({ 
      page, 
      limit: 50, 
      q: searchTerm || undefined,
      agencyId: filterAgency !== 'ALL' ? filterAgency : undefined 
    }),
  });

  const agenciesQuery = useQuery({
    queryKey: ['agencies', 'for-cars'],
    queryFn: () => getAgencies({ page: 1, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsModalOpen(false);
      toast.success('Véhicule ajouté avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de l\'ajout du véhicule.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      setIsModalOpen(false);
      toast.success('Véhicule mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la modification du véhicule.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      toast.success('Véhicule archivé');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la suppression.');
    },
  });

  const handleCreate = () => {
    setSelectedCar(null);
    setIsModalOpen(true);
  };

  const handleEdit = (car: Car) => {
    setSelectedCar({
      ...car,
      id: resolveCarId(car),
      agencyId: resolveAgencyId(car),
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment archiver ce véhicule ?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleView = (car: Car) => {
    setViewingCar(car);
  };

  const handleSubmit = (values: CarFormValues) => {
    if (selectedCar) {
      const carId = resolveCarId(selectedCar);
      if (!carId) {
        toast.error('Impossible de modifier ce véhicule: identifiant introuvable.');
        return;
      }

      updateMutation.mutate({ id: carId, ...values });
      return;
    }
    createMutation.mutate(values);
  };

  const agencies: Agency[] = agenciesQuery.data?.agencies ?? [];

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Flotte de Véhicules
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Gérez votre parc automobile, les spécifications techniques et les disponibilités.
          </p>
        </div>
        
        <Button
          onClick={handleCreate}
          className="h-14 gap-3 bg-red-600 px-8 rounded-2xl font-black text-white transition-all hover:bg-black hover:shadow-2xl hover:shadow-red-500/20 active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Ajouter un véhicule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5 items-center">
        {/* Search Bar */}
        <div className="md:col-span-2">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
            <input
              type="text"
              placeholder="Rechercher par marque, modèle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 font-bold shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Agency Filter */}
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-red-500" />
          <select
            value={filterAgency}
            onChange={(e) => setFilterAgency(e.target.value)}
            className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-slate-900 font-bold shadow-sm transition-all focus:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xlmns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M7%207l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_1rem_center] bg-no-repeat"
          >
            <option value="ALL">Toutes les agences</option>
            {agencies.map((agency) => (
              <option key={agency.id || (agency as any)._id} value={agency.id || (agency as any)._id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 ml-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <CarIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Total</p>
              <p className="text-lg font-black text-slate-900 leading-none">{carsQuery.data?.count || 0}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => carsQuery.refetch()}
            disabled={carsQuery.isLoading || carsQuery.isRefetching}
            className="h-10 w-10 rounded-xl p-0 hover:bg-slate-50 border-slate-100"
          >
            <RefreshCcw size={16} className={cn(carsQuery.isRefetching && "animate-spin")} />
          </Button>
        </div>
      </div>

      {carsQuery.isLoading && !carsQuery.isRefetching ? (
        <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/30">
          <div className="flex flex-col items-center gap-2">
            <RefreshCcw className="h-8 w-8 animate-spin text-slate-300" />
            <p className="text-sm font-bold text-slate-400">Préparation de la liste...</p>
          </div>
        </div>
      ) : carsQuery.isError ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-rose-100 bg-rose-50/50 text-center p-6 text-rose-900 font-bold">
          Erreur de chargement des voitures.
          <Button onClick={() => carsQuery.refetch()} variant="outline" className="mt-4 border-rose-200 text-rose-700 bg-white hover:bg-rose-50 font-bold">
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in transition-all">
          {(carsQuery.data?.cars || []).map((car) => (
            <AdminCarCard
              key={resolveCarId(car)}
              car={car}
              agencies={agencies}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
          {carsQuery.data?.cars?.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 italic text-slate-400">
              Aucun véhicule ne correspond à vos critères.
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCar ? 'Modifier le Véhicule' : 'Ajouter un Véhicule'}
        contentClassName="max-w-4xl"
      >
        <CarForm
          car={selectedCar}
          agencies={agencies}
          onSubmit={handleSubmit}
          isLoading={
            agenciesQuery.isLoading ||
            createMutation.isPending ||
            updateMutation.isPending
          }
        />
      </Modal>

      <Modal
        isOpen={!!viewingCar}
        onClose={() => setViewingCar(null)}
        title="Détails du Véhicule"
        contentClassName="max-w-4xl rounded-[3rem] p-0 overflow-hidden border-none"
      >
        <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-thumb-slate-200 h-full max-h-[90vh]">
           {viewingCar && (
             <CarDetails 
               car={viewingCar} 
               agencies={agencies} 
             />
           )}
        </div>
      </Modal>
    </div>
  );
};
