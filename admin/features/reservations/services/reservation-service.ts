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
  revenue: Array<{
    label: string;
    amount: number;
  }>;
}

export interface RevenueAnalytics {
  monthly: Array<{ label: string; amount: number }>;
  weekly: Array<{ label: string; amount: number }>;
  summary: {
    totalRevenue: number;
    avgBookingValue: number;
    totalBookings: number;
    growth: number;
  };
}

interface GetReservationsParams {
  page: number;
  limit: number;
  status?: ReservationStatus;
  carId?: string;
}

type ReservationListApiResponse = {
  reservations?: unknown[];
  count?: number;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

const unwrapDocumentLike = (value: unknown): unknown => {
  if (!isRecord(value)) {
    return value;
  }

  if (isRecord(value._doc)) {
    return {
      ...value,
      ...value._doc,
    };
  }

  return value;
};

const normalizeDateValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (isRecord(value) && typeof value.$date === 'string') {
    return value.$date;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    const fromTimestamp = new Date(value);
    return Number.isNaN(fromTimestamp.getTime()) ? '' : fromTimestamp.toISOString();
  }

  return '';
};

const toStringOrEmpty = (value: unknown) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    const stringValue = value.toString();
    return stringValue === '[object Object]' ? '' : stringValue;
  }

  return '';
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeCarValue = (value: unknown) => {
  const unwrapped = unwrapDocumentLike(value);

  if (typeof unwrapped === 'string') {
    return unwrapped;
  }

  if (!isRecord(unwrapped)) {
    return '';
  }

  const carId =
    toStringOrEmpty(unwrapped.id) ||
    toStringOrEmpty(unwrapped._id);

  return {
    ...unwrapped,
    id: carId,
    _id: toStringOrEmpty(unwrapped._id) || carId,
  };
};

const normalizeReservation = (reservation: unknown): Reservation => {
  const raw = unwrapDocumentLike(reservation);
  const reservationRecord = isRecord(raw) ? raw : {};
  const rawPricing = unwrapDocumentLike(reservationRecord.pricingBreakdown);
  const pricingBreakdown = isRecord(rawPricing) ? rawPricing : {};

  const id =
    toStringOrEmpty(reservationRecord.id) ||
    toStringOrEmpty(reservationRecord._id);

  const pickupDate = normalizeDateValue(reservationRecord.pickupDate);
  const returnDate = normalizeDateValue(reservationRecord.returnDate);

  const pickupTimestamp = new Date(pickupDate).getTime();
  const returnTimestamp = new Date(returnDate).getTime();
  const hasValidDateRange =
    Number.isFinite(pickupTimestamp) && Number.isFinite(returnTimestamp);

  const computedRentalDays =
    pickupDate && returnDate && hasValidDateRange
      ? Math.max(
          1,
          Math.ceil((returnTimestamp - pickupTimestamp) / (1000 * 60 * 60 * 24)),
        )
      : 0;

  return {
    ...(reservationRecord as unknown as Reservation),
    id,
    _id: toStringOrEmpty(reservationRecord._id) || id,
    bookingReference: toStringOrEmpty(reservationRecord.bookingReference),
    customerName: toStringOrEmpty(reservationRecord.customerName),
    customerEmail: toStringOrEmpty(reservationRecord.customerEmail),
    customerPhone: toStringOrEmpty(reservationRecord.customerPhone),
    pickupDate,
    returnDate,
    pickupTime: toStringOrEmpty(reservationRecord.pickupTime),
    returnTime: toStringOrEmpty(reservationRecord.returnTime),
    rentalDays: toFiniteNumber(
      reservationRecord.rentalDays ?? pricingBreakdown.days,
      computedRentalDays,
    ),
    carId: normalizeCarValue(reservationRecord.carId) as Reservation['carId'],
    pricingBreakdown: pricingBreakdown as Record<string, number>,
  };
};

export const getReservations = async (params: GetReservationsParams) => {
  const response = await get<ReservationListResponse & ReservationListApiResponse>(
    '/admin/reservations',
    { params },
  );

  const reservations = Array.isArray(response.reservations)
    ? response.reservations
    : [];

  return {
    ...response,
    count:
      typeof response.count === 'number'
        ? response.count
        : reservations.length,
    reservations: reservations.map(normalizeReservation),
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

export const markReservationReadyForDelivery = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/ready-for-delivery`);
};

export const markReservationInDelivery = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/in-delivery`);
};

export const markReservationDelivered = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/delivered`);
};

export const markReservationActiveRental = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/active-rental`);
};

export const markReservationReturnScheduled = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/return-scheduled`);
};

export const markReservationReturned = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/returned`);
};

export const markReservationCompleted = async (id: string) => {
  return patch<Reservation>(`/admin/reservations/${id}/complete`);
};

export const verifyReservationPayment = async (id: string) => {
  return post<Record<string, unknown>>(`/payments/${id}/verify`, {});
};

export const getRevenueAnalytics = async () => {
  return get<RevenueAnalytics>('/admin/dashboard/analytics/revenue');
};

export const confirmPayment = async (id: string, data: { paymentMethod: string; amountCollected: number }) => {
  return patch<Reservation>(`/admin/reservations/${id}/confirm-payment`, data);
};
