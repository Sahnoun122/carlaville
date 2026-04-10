'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCcw, 
  Truck, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  MapPin,
  ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  createDelivery,
  getAdminDeliveries,
  getDeliveryAgentsForSelect,
  getReservationsForDeliverySelect,
} from '@/features/deliveries/services/delivery-service';
import { Delivery, DeliveryStatus, DeliveryType } from '@/types';
import { cn } from '@/lib/utils';

const resolveDeliveryId = (delivery: Delivery) =>
  delivery.id || delivery._id || '';

const resolveReservationLabel = (delivery: Delivery) => {
  if (delivery.reservationId && typeof delivery.reservationId === 'object') {
    return `${delivery.reservationId.bookingReference ?? ''} • ${delivery.reservationId.customerName ?? ''}`.trim();
  }
  return 'N/A';
};

const resolveAgentLabel = (delivery: Delivery) => {
  if (delivery.assignedAgentId && typeof delivery.assignedAgentId === 'object') {
    return delivery.assignedAgentId.name || delivery.assignedAgentId.email || 'Agent';
  }
  return 'N/A';
};

const statusConfig: Record<string, { label: string; class: string }> = {
  [DeliveryStatus.PENDING]: { label: 'En attente', class: 'border-amber-200 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100/50' },
  [DeliveryStatus.ASSIGNED]: { label: 'Assignée', class: 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50' },
  [DeliveryStatus.ON_THE_WAY]: { label: 'En route', class: 'border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50' },
  [DeliveryStatus.ARRIVED]: { label: 'Arrivée', class: 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50' },
  [DeliveryStatus.CONFIRMED]: { label: 'Confirmée', class: 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50 shadow-emerald-100/50' },
  [DeliveryStatus.FAILED]: { label: 'Échec', class: 'border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100/50' },
  [DeliveryStatus.CANCELLED]: { label: 'Annulée', class: 'border-slate-200 bg-slate-50 text-slate-500 shadow-sm shadow-slate-100/50' },
};

export const AdminDeliveriesManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DeliveryType>('all');

  const deliveriesQuery = useQuery({
    queryKey: ['admin-deliveries', page, statusFilter, typeFilter],
    queryFn: () =>
      getAdminDeliveries({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        type: typeFilter === 'all' ? undefined : typeFilter,
      }),
  });

  const reservationsQuery = useQuery({
    queryKey: ['delivery-reservations-select'],
    queryFn: getReservationsForDeliverySelect,
  });

  const agentsQuery = useQuery({
    queryKey: ['delivery-agents-select'],
    queryFn: getDeliveryAgentsForSelect,
  });

  const createMutation = useMutation({
    mutationFn: createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deliveries'] });
      toast.success('Livraison créée et attribuée');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Échec de la création.');
    },
  });

  const isLoadingOptions = reservationsQuery.isLoading || agentsQuery.isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const reservationId = String(formData.get('reservationId') || '');
    const assignedAgentId = String(formData.get('assignedAgentId') || '');
    const type = String(formData.get('type') || '') as DeliveryType;
    const scheduledDate = String(formData.get('scheduledDate') || '');
    const scheduledTime = String(formData.get('scheduledTime') || '');
    const notes = String(formData.get('notes') || '');

    if (!reservationId || !assignedAgentId || !type || !scheduledDate || !scheduledTime) {
      toast.error('Tous les champs sont obligatoires.');
      return;
    }

    createMutation.mutate({
      reservationId,
      assignedAgentId,
      type,
      scheduledDate,
      scheduledTime,
      notes: notes.trim() || undefined,
    });

    event.currentTarget.reset();
  };

  return (
    <div className="w-full space-y-8 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Gestion des Livraisons
          </h1>
          <p className="mt-2 text-slate-500">
            Coordonnez vos équipes sur le terrain pour les remises et retours de véhicules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Creation Form */}
        <div className="md:sticky md:top-8 p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 px-2">
             <Plus className="w-5 h-5 text-red-600" />
             <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Nouvelle Attribution</h2>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Réservation</label>
              <select
                name="reservationId"
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xlmns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M7%207l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat"
                disabled={isLoadingOptions}
                defaultValue=""
              >
                <option value="" disabled>Référence...</option>
                {(reservationsQuery.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Agent Responsable</label>
              <select
                name="assignedAgentId"
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xlmns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M7%207l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat"
                disabled={isLoadingOptions}
                defaultValue=""
              >
                <option value="" disabled>Sélectionner agent...</option>
                {(agentsQuery.data ?? []).map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Type</label>
                 <select name="type" className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl font-bold appearance-none" defaultValue={DeliveryType.PICKUP}>
                   <option value={DeliveryType.PICKUP}>Récupération</option>
                   <option value={DeliveryType.RETURN}>Retour</option>
                 </select>
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Heure</label>
                 <input name="scheduledTime" type="time" className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl font-bold" />
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Date d'opération</label>
              <input name="scheduledDate" type="date" className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl font-bold" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Notes internes</label>
              <textarea name="notes" placeholder="Détails supplémentaires..." className="w-full p-4 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 font-medium" rows={3} />
            </div>

            <Button 
               type="submit" 
               className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-xl shadow-red-100 transition-all active:scale-95" 
               disabled={createMutation.isPending}
            >
              Lancer l'opération
            </Button>
          </form>
        </div>

        {/* Deliveries List */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 group">
                   <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-red-500" />
                   <select 
                     value={statusFilter} 
                     onChange={(e) => setStatusFilter(e.target.value as any)}
                     className="w-full h-12 pl-11 pr-10 bg-slate-50 border-none rounded-xl font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xlmns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M7%207l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat cursor-pointer"
                   >
                     <option value="all">Tous les statuts</option>
                     {Object.values(DeliveryStatus).map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                </div>
                <div className="relative flex-1 group">
                   <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-red-500" />
                   <select 
                     value={typeFilter} 
                     onChange={(e) => setTypeFilter(e.target.value as any)}
                     className="w-full h-12 pl-11 pr-10 bg-slate-50 border-none rounded-xl font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xlmns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M7%207l3%203%203-3%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat cursor-pointer"
                   >
                     <option value="all">Tous types</option>
                     <option value={DeliveryType.PICKUP}>Récupération</option>
                     <option value={DeliveryType.RETURN}>Retour</option>
                   </select>
                </div>
             </div>
             <Button
                variant="outline"
                size="sm"
                onClick={() => deliveriesQuery.refetch()}
                className="h-12 w-12 rounded-xl p-0 hover:bg-slate-50 transition-all active:scale-95 border-none bg-slate-50"
              >
                <RefreshCcw size={18} className={cn(deliveriesQuery.isRefetching && "animate-spin", "text-slate-500")} />
              </Button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            {deliveriesQuery.isLoading && !deliveriesQuery.isRefetching ? (
              <div className="p-20 text-center flex flex-col items-center gap-2">
                 <RefreshCcw className="w-8 h-8 animate-spin text-slate-200" />
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sychronisation...</p>
              </div>
            ) : deliveriesQuery.isError ? (
              <div className="p-20 text-center text-rose-600 font-bold bg-rose-50/50">Erreur de chargement.</div>
            ) : (
              <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="bg-slate-50/50 text-left">
                      <th className="px-4 py-4 sm:px-6 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Opération / Réf</th>
                      <th className="px-4 py-4 sm:px-6 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Intervenant</th>
                      <th className="px-4 py-4 sm:px-6 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Date & Heure</th>
                      <th className="px-4 py-4 sm:px-6 sm:py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {deliveriesQuery.data?.deliveries.map((delivery) => {
                      const status = statusConfig[delivery.status] || { label: delivery.status, class: 'bg-slate-100 text-slate-600' };
                      return (
                        <tr key={resolveDeliveryId(delivery)} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "h-10 w-10 flex items-center justify-center rounded-xl ring-2 ring-white shadow-sm shrink-0 transition-all group-hover:scale-110",
                                 delivery.type === DeliveryType.PICKUP ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                               )}>
                                  <Truck size={18} />
                               </div>
                               <div className="flex flex-col">
                                  <span className="text-sm font-black text-slate-900 leading-tight">
                                     {delivery.type === DeliveryType.PICKUP ? 'Remise Clés' : 'Récupération'}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 font-mono">{resolveReservationLabel(delivery)}</span>
                               </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center gap-2">
                               <User size={14} className="text-slate-300" />
                               <span className="text-xs font-bold text-slate-700">{resolveAgentLabel(delivery)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-center">
                            <div className="flex flex-col items-center">
                               <span className="text-xs font-black text-slate-900">{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
                               <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 rounded-full mt-1 border border-red-100">{delivery.scheduledTime}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 sm:px-6 sm:py-5 text-right">
                             <span className={cn(
                               "inline-flex px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tight",
                               status.class
                             )}>
                               {status.label}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
