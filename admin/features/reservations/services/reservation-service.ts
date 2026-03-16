import { get, patch } from '@/lib/api';
import {
  Reservation,
  ReservationListResponse,
  ReservationStatus,
} from '@/types';

interface GetReservationsParams {
  page: number;
  limit: number;
  status?: ReservationStatus;
  carId?: string;
}

const resolveReservationId = (reservation: Reservation) =>
  reservation.id || reservation._id || '';

const normalizeReservation = (reservation: Reservation): Reservation => ({
  ...reservation,
  id: resolveReservationId(reservation),
});

export const getReservations = async (params: GetReservationsParams) => {
  const response = await get<ReservationListResponse>(
    '/admin/reservations',
    { params },
  );

  return {
    ...response,
    reservations: response.reservations.map(normalizeReservation),
  };
};

export const confirmReservation = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/confirm`);
};

export const rejectReservation = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/reject`);
};

export const markReservationPending = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/pending`);
};
