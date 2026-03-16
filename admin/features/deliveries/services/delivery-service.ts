import { get, patch, post } from '@/lib/api';
import { Delivery, DeliveryListResponse, DeliveryStatus, DeliveryType, User } from '@/types';
import { getUsers } from '@/features/users/services/user-service';
import { getReservations } from '@/features/reservations/services/reservation-service';

interface DeliveryFilters {
  page: number;
  limit: number;
  status?: DeliveryStatus;
  type?: DeliveryType;
  assignedAgentId?: string;
  reservationId?: string;
}

export interface CreateDeliveryPayload {
  reservationId: string;
  assignedAgentId: string;
  type: DeliveryType;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export interface UpdateDeliveryStatusPayload {
  id: string;
  status: DeliveryStatus;
  notes?: string;
  gpsLocation?: string;
  checklist?: Record<string, boolean>;
}

const normalizeDelivery = (delivery: Delivery): Delivery => ({
  ...delivery,
  id: delivery.id || delivery._id || '',
});

const normalizeListResponse = (response: DeliveryListResponse) => ({
  ...response,
  deliveries: response.deliveries.map(normalizeDelivery),
});

export const getAdminDeliveries = async (filters: DeliveryFilters) => {
  const response = await get<DeliveryListResponse>('/admin/deliveries', {
    params: filters,
  });
  return normalizeListResponse(response);
};

export const createDelivery = async (payload: CreateDeliveryPayload) => {
  return post<Delivery>('/admin/deliveries', payload);
};

export const getOperationsDeliveries = async (filters: DeliveryFilters) => {
  const response = await get<DeliveryListResponse>('/operations/deliveries', {
    params: filters,
  });
  return normalizeListResponse(response);
};

export const updateOperationsDeliveryStatus = async (
  payload: UpdateDeliveryStatusPayload,
) => {
  const { id, ...data } = payload;
  return patch<Delivery>(`/operations/deliveries/${id}/status`, data);
};

export const getDeliveryAgentsForSelect = async () => {
  const response = await getUsers({ page: 1, limit: 100 });

  const agents = response.users.filter(
    (user: User) => user.role === 'DELIVERY_AGENT',
  );

  return agents.map((agent: User) => ({
    id: agent.id || (agent as User & { _id?: string })._id || '',
    label: agent.name || `${agent.firstName ?? ''} ${agent.lastName ?? ''}`.trim() || agent.email,
  }));
};

export const getReservationsForDeliverySelect = async () => {
  const response = await getReservations({ page: 1, limit: 100 });

  return response.reservations.map((reservation) => {
    const id = reservation.id || reservation._id || '';
    const vehicle =
      reservation.carId && typeof reservation.carId === 'object'
        ? `${reservation.carId.brand} ${reservation.carId.model}`
        : 'Vehicle';

    return {
      id,
      label: `${reservation.bookingReference} • ${vehicle} • ${reservation.customerName}`,
    };
  });
};
