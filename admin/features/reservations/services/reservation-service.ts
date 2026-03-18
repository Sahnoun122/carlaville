import { get, patch, post } from '@/lib/api';
import {
  Reservation,
  ReservationListResponse,
  ReservationStatus,
} from '@/types';

export interface CreateReservationPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  agencyId: string;
  carId: string;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  selectedExtras: string[];
  pricingBreakdown: Record<string, number>;
}

export interface ReservationManagerDashboardStats {
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    activeRentals: number;
    todayPickups: number;
    todayReturns: number;
  };
  maintenance: {
    inProgressCars: number;
  };
  recentReservations: Array<{
    _id: string;
    bookingReference: string;
    customerName: string;
    pickupDate: string;
    returnDate: string;
    status: ReservationStatus;
    createdAt: string;
  }>;
}

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

export const createReservation = async (payload: CreateReservationPayload) => {
  return post<Reservation>('/admin/reservations', payload);
};

export const getReservationManagerDashboardStats = async () => {
  return get<ReservationManagerDashboardStats>('/admin/dashboard/reservation-manager');
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
