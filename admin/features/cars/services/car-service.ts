import { del, get, patch, post } from '@/lib/api';
import {
  AvailabilityStatus,
  Car,
  CarCategory,
  FuelType,
  MaintenanceRecord,
  Transmission,
  Agency,
} from '@/types';

export interface CarFormValues {
  agencyId?: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  luggage?: number;
  dailyPrice: number;
  minRentalDays?: number;
  depositAmount?: number;
  deliveryFee?: number;
  city: string;
  availabilityStatus: AvailabilityStatus;
  images?: string[];
}

interface UpdateCarPayload extends CarFormValues {
  id: string;
}

export interface StartMaintenancePayload {
  id: string;
  reason: string;
  notes?: string;
  estimatedCost?: number;
}

export interface CompleteMaintenancePayload {
  id: string;
  notes?: string;
  finalCost?: number;
  endedAt?: string;
  nextAvailabilityStatus?: AvailabilityStatus;
}

export const getCars = async (params: {
  page: number;
  limit: number;
  city?: string;
  category?: CarCategory;
  availability?: AvailabilityStatus;
}) => {
  return get<{ cars: Car[]; count: number }>('/admin/cars', { params });
};

export const getCarById = async (id: string) => {
  return get<Car>(`/admin/cars/${id}`);
};

export const getAgencies = async () => {
  const response = await get<{ agencies: Agency[]; count: number }>('/admin/agencies', {
    params: { page: 1, limit: 100 },
  });

  return {
    ...response,
    agencies: response.agencies.map((agency) => ({
      ...agency,
      id: agency.id || agency._id || '',
    })),
  };
};

export const createCar = async (data: CarFormValues) => {
  const payload: Record<string, unknown> = {
    ...data,
    images: data.images?.filter((item) => item.trim().length > 0) ?? [],
  };

  if (!data.agencyId || data.agencyId.trim().length === 0) {
    delete payload.agencyId;
  }

  return post<Car>('/admin/cars', payload);
};

export const updateCar = async (data: UpdateCarPayload) => {
  const { id, ...payload } = data;

  const normalizedPayload: Record<string, unknown> = {
    ...payload,
    images: payload.images?.filter((item) => item.trim().length > 0) ?? [],
  };

  if (!payload.agencyId || payload.agencyId.trim().length === 0) {
    delete normalizedPayload.agencyId;
  }

  return patch<Car>(`/admin/cars/${id}`, normalizedPayload);
};

export const deleteCar = async (id: string) => {
  return del(`/admin/cars/${id}`);
};

export const startCarMaintenance = async (payload: StartMaintenancePayload) => {
  const { id, ...data } = payload;
  return patch<Car>(`/admin/cars/${id}/maintenance/start`, data);
};

export const completeCarMaintenance = async (
  payload: CompleteMaintenancePayload,
) => {
  const { id, ...data } = payload;
  return patch<Car>(`/admin/cars/${id}/maintenance/complete`, data);
};

export const getCarMaintenanceHistory = async (id: string) => {
  return get<{
    carId: string;
    carLabel: string;
    availabilityStatus: AvailabilityStatus;
    history: MaintenanceRecord[];
  }>(`/admin/cars/${id}/maintenance/history`);
};
