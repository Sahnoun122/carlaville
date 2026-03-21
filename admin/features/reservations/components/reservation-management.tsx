'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  [ReservationStatus.PENDING]: 'bg-amber-100 text-amber-800 border border-amber-200',
  [ReservationStatus.CONFIRMED]: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  [ReservationStatus.REJECTED]: 'bg-rose-100 text-rose-800 border border-rose-200',
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
        limit: 20,
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
    <div className="space-y-6">
      <PageHeader 
        title="Opérations de Réservation" 
        description="Créez et gérez toutes les réservations depuis un seul endroit."
      >
        <Button onClick={openCreateModal}>Créer une Réservation</Button>
      </PageHeader>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Créer une Réservation"
        contentClassName="max-w-4xl"
      >
        {createError && <p className="text-sm text-rose-600 mb-3">{createError}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
          <input
            placeholder="Client (nom)"
            value={formData.customerName}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, customerName: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="email"
            placeholder="Email client"
            value={formData.customerEmail}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, customerEmail: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            placeholder="Téléphone client"
            value={formData.customerPhone}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, customerPhone: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <select
            value={formData.agencyId}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, agencyId: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          >
            <option value="">Sélectionner une agence</option>
            {(agenciesQuery.data?.agencies ?? []).map((agency) => (
              <option key={agency.id || agency._id} value={agency.id || agency._id}>
                {agency.name}
              </option>
            ))}
          </select>
          <select
            value={formData.carId}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, carId: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          >
            <option value="">Sélectionner un véhicule</option>
            {(carsQuery.data?.cars ?? []).map((car) => {
              const carId = resolveCarId(car);

              return (
                <option key={carId} value={carId}>
                  {car.brand} {car.model}
                </option>
              );
            })}
          </select>
          <input
            placeholder="Lieu de départ"
            value={formData.pickupLocation}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, pickupLocation: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            placeholder="Lieu de retour"
            value={formData.returnLocation}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, returnLocation: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="date"
            value={formData.pickupDate}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, pickupDate: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="date"
            value={formData.returnDate}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, returnDate: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="time"
            value={formData.pickupTime}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, pickupTime: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="time"
            value={formData.returnTime}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, returnTime: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            placeholder="Options (séparées par des virgules)"
            value={formData.selectedExtras}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, selectedExtras: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
          <input
            type="number"
            placeholder="Total estimé (MAD)"
            value={formData.estimatedTotal}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, estimatedTotal: event.target.value }))
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button className="shadow-sm" onClick={handleCreateReservation} disabled={createMutation.isPending}>
            Créer la Réservation
          </Button>
        </div>
      </Modal>

      {actionError && <p className="text-sm text-rose-600">{actionError}</p>}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Filtrer par véhicule</label>
            <select
              value={selectedCarId}
              onChange={(event) => setSelectedCarId(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            >
              <option value="all">Tous les véhicules</option>
              {vehicleFilterOptions.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">Filtrer par statut</label>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button className="shadow-sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['reservations'] })}>
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {reservationsQuery.isLoading && <p className="text-sm text-slate-600">Chargement des réservations...</p>}
      {reservationsQuery.isError && <p className="text-sm text-rose-600">Erreur lors du chargement des réservations.</p>}

      {reservationsQuery.data && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Référence</th>
                <th className="px-4 py-3 font-medium">Véhicule</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservationsQuery.data.reservations.map((reservation) => {
                const reservationId = resolveReservationId(reservation);

                return (
                  <tr key={reservationId} className="border-t border-slate-200 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800">{reservation.bookingReference}</td>
                    <td className="px-4 py-3 text-slate-700">{resolveVehicleLabel(reservation)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{reservation.customerName}</div>
                      <div className="text-xs text-slate-500">{reservation.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <div>{new Date(reservation.pickupDate).toLocaleDateString()} → {new Date(reservation.returnDate).toLocaleDateString()}</div>
                      <div className="text-xs text-slate-500">{reservation.rentalDays} jour(s)</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          reservationStatusBadgeClass[reservation.status] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {canManageReservationStatus && reservation.status === ReservationStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            className="shadow-sm"
                            onClick={() => confirmMutation.mutate(reservationId)}
                            disabled={isActionPending}
                          >
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="ml-2 shadow-sm"
                            onClick={() => rejectMutation.mutate(reservationId)}
                            disabled={isActionPending}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}

                      {canManageReservationStatus && (reservation.status === ReservationStatus.CONFIRMED ||
                        reservation.status === ReservationStatus.REJECTED) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-slate-700 hover:bg-slate-100"
                          onClick={() => pendingMutation.mutate(reservationId)}
                          disabled={isActionPending}
                        >
                          Mettre en attente
                        </Button>
                      )}

                      {!canManageReservationStatus && <span className="text-xs text-slate-500">Consultation uniquement</span>}

                      {canManageReservationStatus &&
                        reservation.status !== ReservationStatus.PENDING &&
                        reservation.status !== ReservationStatus.CONFIRMED &&
                        reservation.status !== ReservationStatus.REJECTED && (
                          <span className="text-xs text-slate-500">Aucune action</span>
                        )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
