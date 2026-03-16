import {
  AvailabilityStatus,
  CarCategory,
  FuelType,
  Transmission,
} from './car.enum';

export interface MaintenanceRecord {
  startedAt: string;
  endedAt?: string;
  reason: string;
  notes?: string;
  estimatedCost?: number;
  finalCost?: number;
  status: 'ongoing' | 'completed';
}

export interface Car {
  id: string;
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
  depositAmount?: number;
  deliveryFee?: number;
  city: string;
  availabilityStatus: AvailabilityStatus;
  images?: string[];
  active: boolean;
  maintenanceHistory?: MaintenanceRecord[];
  createdAt?: string;
  updatedAt?: string;
  agency?: {
    id?: string;
    name?: string;
  };
}
