'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  Mail, 
  Phone, 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Car as CarIcon,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { getCars } from '@/features/cars/services/car-service';
import { getAgencies } from '@/features/agencies/services/agency-service';
import {
  confirmReservation,
  createReservation,
  getReservations,
  markReservationPending,
  rejectReservation,
} from '@/features/reservations/services/reservation-service';
import { useAuth } from '@/providers/auth-provider';
import { PageHeader } from '@/components/shared/page-header';
import { Car, Reservation, ReservationStatus, Role } from '@/types';

const resolveCarId = (car: Car) => car.id || (car as Car & { _id?: string })._id || '';

const resolveReservationId = (reservation: Reservation) =>
  reservation.id || reservation._id || '';

const resolveVehicleLabel = (reservation: Reservation) => {
  if (reservation.carId && typeof reservation.carId === 'object') {
    return `${reservation.carId.brand} ${reservation.carId.model}`;
  }
  return 'Véhicule inconnu';
};

const statusOptions = [
  { label: 'Tous les statuts', value: 'all' },
  { label: 'En attente', value: ReservationStatus.PENDING },
  { label: 'Confirmée', value: ReservationStatus.CONFIRMED },
  { label: 'Rejetée', value: ReservationStatus.REJECTED },
];

const reservationStatusBadgeClass: Record<string, string> = {
  [ReservationStatus.PENDING]: 'bg-amber-50 text-amber-600 border border-amber-100',
  [ReservationStatus.CONFIRMED]: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  [ReservationStatus.REJECTED]: 'bg-red-50 text-red-600 border border-red-100',
};

export const ReservationManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedCarId, setSelectedCarId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    agencyId: '',
    carId: '',
    pickupLocation: '',
    returnLocation: '',
    pickupDate: '',
    returnDate: '',
    pickupTime: '',
    returnTime: '',
    selectedExtras: '',
    estimatedTotal: '',
  });

  const canManageReservationStatus =
    user?.role === Role.ADMIN || user?.role === Role.RESERVATION_MANAGER;

  const reservationsQuery = useQuery({
    queryKey: ['reservations', page, selectedCarId, selectedStatus],
    queryFn: () =>
      getReservations({
        page,
        limit: 50,
        carId: selectedCarId !== 'all' ? selectedCarId : undefined,
        status:
          selectedStatus !== 'all'
            ? (selectedStatus as ReservationStatus)
            : undefined,
      }),
  });

  const carsQuery = useQuery({
    queryKey: ['cars', 'reservation-filter'],
    queryFn: () => getCars({ page: 1, limit: 100 }),
  });

  const agenciesQuery = useQuery({
    queryKey: ['agencies', 'reservation-create'],
    queryFn: () => getAgencies({ page: 1, limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      setCreateError(null);
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        agencyId: '',
        carId: '',
        pickupLocation: '',
        returnLocation: '',
        pickupDate: '',
        returnDate: '',
        pickupTime: '',
        returnTime: '',
        selectedExtras: '',
        estimatedTotal: '',
      });
      setIsCreateModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Failed to create reservation.';
      setCreateError(message);
    },
  });

  const onMutationSuccess = () => {
    setActionError(null);
    queryClient.invalidateQueries({ queryKey: ['reservations'] });
  };

  const confirmMutation = useMutation({
    mutationFn: confirmReservation,
    onSuccess: onMutationSuccess,
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec de la confirmation.';
      setActionError(message);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectReservation,
    onSuccess: onMutationSuccess,
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec du rejet.';
      setActionError(message);
    },
  });

  const pendingMutation = useMutation({
    mutationFn: markReservationPending,
    onSuccess: onMutationSuccess,
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Échec de la mise en attente.';
      setActionError(message);
    },
  });

  const isActionPending =
    confirmMutation.isPending || rejectMutation.isPending || pendingMutation.isPending;

  const handleCreateReservation = () => {
    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.customerPhone ||
      !formData.agencyId ||
      !formData.carId ||
      !formData.pickupLocation ||
      !formData.returnLocation ||
      !formData.pickupDate ||
      !formData.returnDate ||
      !formData.pickupTime ||
      !formData.returnTime
    ) {
      setCreateError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    createMutation.mutate({
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      agencyId: formData.agencyId,
      carId: formData.carId,
      pickupLocation: formData.pickupLocation,
      returnLocation: formData.returnLocation,
      pickupDate: formData.pickupDate,
      returnDate: formData.returnDate,
      pickupTime: formData.pickupTime,
      returnTime: formData.returnTime,
      selectedExtras: formData.selectedExtras
        .split(',')
        .map((extra) => extra.trim())
        .filter((extra) => extra.length > 0),
      pricingBreakdown: {
        estimatedTotal: formData.estimatedTotal
          ? Number(formData.estimatedTotal)
          : 0,
      },
    });
  };

  const openCreateModal = () => {
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (!createMutation.isPending) {
      setIsCreateModalOpen(false);
    }
  };

  const vehicleFilterOptions = useMemo(
    () =>
      (carsQuery.data?.cars ?? []).map((car) => ({
        id: resolveCarId(car),
        label: `${car.brand} ${car.model} (${car.city})`,
      })),
    [carsQuery.data?.cars],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Gestion des Réservations" 
        description="Centralisez toutes les demandes de location et gérez les flux opérationnels."
      >
        <Button 
          onClick={openCreateModal}
          className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 text-white font-bold h-11 px-6 rounded-xl transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Réservation
        </Button>
      </PageHeader>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Nouvelle Réservation"
        contentClassName="max-w-4xl rounded-[2.5rem]"
      >
        <div className="p-2">
          {createError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600">
              {createError}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[65vh] overflow-y-auto pr-4 scrollbar-thin">
             {/* Section: Client */}
             <div className="space-y-4">
               <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Informations Client</h3>
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Nom complet du client"
                    value={formData.customerName}
                    onChange={(e) => setFormData(p => ({ ...p, customerName: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold text-gray-900"
                  />
               </div>
               <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Adresse email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(p => ({ ...p, customerEmail: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold text-gray-900"
                  />
               </div>
               <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    placeholder="Numéro de téléphone"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(p => ({ ...p, customerPhone: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 transition-all font-bold text-gray-900"
                  />
               </div>
             </div>

             {/* Section: Véhicule & Agence */}
             <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Véhicule & Agence</h3>
                <div className="relative">
                  <select
                    value={formData.agencyId}
                    onChange={(e) => setFormData(p => ({ ...p, agencyId: e.target.value }))}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 appearance-none font-bold text-gray-900 cursor-pointer"
                  >
                    <option value="">Sélectionner une agence</option>
                    {(agenciesQuery.data?.agencies ?? []).map((agency) => (
                      <option key={agency.id || agency._id} value={agency.id || agency._id}>
                        {agency.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={formData.carId}
                    onChange={(e) => setFormData(p => ({ ...p, carId: e.target.value }))}
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 appearance-none font-bold text-gray-900 cursor-pointer"
                  >
                    <option value="">Sélectionner un véhicule</option>
                    {(carsQuery.data?.cars ?? []).map((car) => {
                      const carId = resolveCarId(car);
                      return <option key={carId} value={carId}>{car.brand} {car.model}</option>;
                    })}
                  </select>
                </div>
             </div>

             {/* Section: Dates & Lieux */}
             <div className="space-y-4 md:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Logistique</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase ml-4">Prise en charge</p>
                    <div className="grid grid-cols-2 gap-2">
                       <input type="date" value={formData.pickupDate} onChange={e => setFormData(p => ({...p, pickupDate: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900" />
                       <input type="time" value={formData.pickupTime} onChange={e => setFormData(p => ({...p, pickupTime: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900" />
                    </div>
                    <input placeholder="Lieu de prise en charge" value={formData.pickupLocation} onChange={e => setFormData(p => ({...p, pickupLocation: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase ml-4">Retour</p>
                    <div className="grid grid-cols-2 gap-2">
                       <input type="date" value={formData.returnDate} onChange={e => setFormData(p => ({...p, returnDate: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900" />
                       <input type="time" value={formData.returnTime} onChange={e => setFormData(p => ({...p, returnTime: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900" />
                    </div>
                    <input placeholder="Lieu de retour" value={formData.returnLocation} onChange={e => setFormData(p => ({...p, returnLocation: e.target.value}))} className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900" />
                  </div>
                </div>
             </div>

             {/* Section: Options & Total */}
             <div className="space-y-4 md:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Extras & Tarification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    placeholder="Options (ex: Siège bébé, GPS...)"
                    value={formData.selectedExtras}
                    onChange={(e) => setFormData(p => ({ ...p, selectedExtras: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Total estimé (MAD)"
                      value={formData.estimatedTotal}
                      onChange={(e) => setFormData(p => ({ ...p, estimatedTotal: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold text-gray-900"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">MAD</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
            <Button variant="outline" className="font-bold text-gray-500 border-none hover:bg-gray-50 h-12 px-8 rounded-2xl" onClick={closeCreateModal}>Annuler</Button>
            <Button 
               className="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20 text-white font-bold h-12 px-10 rounded-2xl transition-all" 
               onClick={handleCreateReservation} 
               disabled={createMutation.isPending}
            >
              Finaliser la Réservation
            </Button>
          </div>
        </div>
      </Modal>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-600 animate-in slide-in-from-top duration-300">
          {actionError}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
           <Filter className="w-5 h-5 text-gray-400" />
           <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Filtres de recherche</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <CarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 appearance-none font-bold text-gray-800 cursor-pointer"
            >
              <option value="all">Tous les véhicules</option>
              {vehicleFilterOptions.map((car) => (
                <option key={car.id} value={car.id}>{car.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 appearance-none font-bold text-gray-800 cursor-pointer"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <Button 
            variant="outline"
            className="h-full rounded-2xl border-gray-100 bg-gray-50 hover:bg-gray-100 font-bold transition-all flex items-center gap-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['reservations'] })}
          >
            <RefreshCw className={`w-4 h-4 ${reservationsQuery.isFetching ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {reservationsQuery.isLoading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-red-100 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold">Chargement des données...</p>
          </div>
        ) : reservationsQuery.isError ? (
          <div className="p-20 text-center text-red-600 font-bold">Erreur lors du chargement des réservations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-tl-[2.5rem]">Référence / Véhicule</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Dates & Durée</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Statut</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] rounded-tr-[2.5rem]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservationsQuery.data?.reservations.map((reservation) => {
                  const reservationId = resolveReservationId(reservation);
                  return (
                    <tr key={reservationId} className="group hover:bg-gray-50 transition-all duration-300">
                      <td className="px-6 py-6 align-middle">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 self-start">
                            {reservation.bookingReference}
                          </span>
                          <span className="text-xs font-bold text-gray-600 ml-1">{resolveVehicleLabel(reservation)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-middle">
                        <div className="flex items-start gap-3">
                           <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 border border-red-100 shadow-sm shrink-0">
                              <User className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-black text-gray-900">{reservation.customerName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Phone className="w-2.5 h-2.5 text-gray-300" />
                                 <span className="text-[10px] font-bold text-gray-400">{reservation.customerPhone}</span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-middle">
                        <div className="flex flex-col gap-1.5 pl-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                             <span className="text-gray-900">{new Date(reservation.pickupDate).toLocaleDateString()}</span>
                             <ChevronRight className="w-3 h-3 text-gray-300" />
                             <span className="text-gray-500 font-medium">{new Date(reservation.returnDate).toLocaleDateString()}</span>
                          </div>
                          <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded-full border border-red-100 self-start">
                             {reservation.rentalDays} JOURS
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                            reservationStatusBadgeClass[reservation.status] ?? 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right align-middle">
                        <div className="flex justify-end gap-2">
                           {canManageReservationStatus && reservation.status === ReservationStatus.PENDING && (
                             <>
                               <Button
                                 size="sm"
                                 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 px-4 transition-all hover:-translate-y-0.5"
                                 onClick={() => confirmMutation.mutate(reservationId)}
                                 disabled={isActionPending}
                               >
                                 <Check className="w-4 h-4 mr-1.5" />
                                 Accepter
                               </Button>
                               <Button
                                 size="sm"
                                 variant="destructive"
                                 className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 px-4 transition-all hover:-translate-y-0.5"
                                 onClick={() => rejectMutation.mutate(reservationId)}
                                 disabled={isActionPending}
                               >
                                 <X className="w-4 h-4 mr-1.5" />
                                 Rejeter
                               </Button>
                             </>
                           )}

                           {canManageReservationStatus && (reservation.status === ReservationStatus.CONFIRMED ||
                             reservation.status === ReservationStatus.REJECTED) && (
                             <Button
                               size="sm"
                               variant="outline"
                               className="border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-red-100 transition-all"
                               onClick={() => pendingMutation.mutate(reservationId)}
                               disabled={isActionPending}
                             >
                                <Clock className="w-4 h-4 mr-1.5" />
                                Suspendre
                             </Button>
                           )}

                           <button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all text-gray-400">
                              <MoreHorizontal className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center px-4">
         <p className="text-xs font-bold text-gray-400">Affichage de {reservationsQuery.data?.reservations?.length || 0} réservations sur {reservationsQuery.data?.count || 0}</p>
         <div className="flex gap-2">
            <Button variant="outline" disabled className="h-9 px-4 rounded-xl border-gray-100 font-bold text-gray-400">Précédent</Button>
            <Button variant="outline" disabled className="h-9 px-4 rounded-xl border-gray-100 font-bold text-gray-400">Suivant</Button>
         </div>
      </div>
    </div>
  );
};
