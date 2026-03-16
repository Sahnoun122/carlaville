'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { getCars } from '@/features/cars/services/car-service';
import {
  confirmReservation,
  getReservations,
  markReservationPending,
  rejectReservation,
} from '@/features/reservations/services/reservation-service';
import { Car, Reservation, ReservationStatus } from '@/types';

const resolveCarId = (car: Car) => car.id || (car as Car & { _id?: string })._id || '';

const resolveReservationId = (reservation: Reservation) =>
  reservation.id || reservation._id || '';

const resolveVehicleLabel = (reservation: Reservation) => {
  if (reservation.carId && typeof reservation.carId === 'object') {
    return `${reservation.carId.brand} ${reservation.carId.model}`;
  }

  return 'Unknown vehicle';
};

const statusOptions = [
  { label: 'All statuses', value: 'all' },
  { label: 'Pending', value: ReservationStatus.PENDING },
  { label: 'Confirmed', value: ReservationStatus.CONFIRMED },
  { label: 'Rejected', value: ReservationStatus.REJECTED },
];

export const ReservationManagement = () => {
  const queryClient = useQueryClient();
  const [page] = useState(1);
  const [selectedCarId, setSelectedCarId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionError, setActionError] = useState<string | null>(null);

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
          : 'Failed to confirm reservation.';

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
          : 'Failed to reject reservation.';

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
          : 'Failed to move reservation to pending.';

      setActionError(message);
    },
  });

  const isActionPending =
    confirmMutation.isPending || rejectMutation.isPending || pendingMutation.isPending;

  const vehicleFilterOptions = useMemo(
    () =>
      (carsQuery.data?.cars ?? []).map((car) => ({
        id: resolveCarId(car),
        label: `${car.brand} ${car.model} (${car.city})`,
      })),
    [carsQuery.data?.cars],
  );

  return (
    <div className="space-y-4">
      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      <div className="rounded-md border bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block mb-1 text-sm font-medium">Filter by vehicle</label>
            <select
              value={selectedCarId}
              onChange={(event) => setSelectedCarId(event.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="all">All vehicles</option>
              {vehicleFilterOptions.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Filter by status</label>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['reservations'] })}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {reservationsQuery.isLoading && <p>Loading reservations...</p>}
      {reservationsQuery.isError && <p>Error loading reservations.</p>}

      {reservationsQuery.data && (
        <div className="overflow-x-auto rounded-md border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Dates</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservationsQuery.data.reservations.map((reservation) => {
                const reservationId = resolveReservationId(reservation);

                return (
                  <tr key={reservationId} className="border-t">
                    <td className="px-4 py-3 font-medium">{reservation.bookingReference}</td>
                    <td className="px-4 py-3">{resolveVehicleLabel(reservation)}</td>
                    <td className="px-4 py-3">
                      <div>{reservation.customerName}</div>
                      <div className="text-xs text-gray-500">{reservation.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{new Date(reservation.pickupDate).toLocaleDateString()} → {new Date(reservation.returnDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{reservation.rentalDays} day(s)</div>
                    </td>
                    <td className="px-4 py-3">{reservation.status}</td>
                    <td className="px-4 py-3">
                      {reservation.status === ReservationStatus.PENDING && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => confirmMutation.mutate(reservationId)}
                            disabled={isActionPending}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="ml-2"
                            onClick={() => rejectMutation.mutate(reservationId)}
                            disabled={isActionPending}
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {(reservation.status === ReservationStatus.CONFIRMED ||
                        reservation.status === ReservationStatus.REJECTED) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pendingMutation.mutate(reservationId)}
                          disabled={isActionPending}
                        >
                          Set Pending
                        </Button>
                      )}

                      {reservation.status !== ReservationStatus.PENDING &&
                        reservation.status !== ReservationStatus.CONFIRMED &&
                        reservation.status !== ReservationStatus.REJECTED && (
                          <span className="text-xs text-gray-500">No action</span>
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
