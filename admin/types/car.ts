import {
  AvailabilityStatus,
  CarCategory,
  FuelType,
  Transmission,
} from './car.enum';
import { Agency } from './agency';

export interface MaintenanceRecord {
  startedAt: string;
  endedAt?: string;
  reason: string;
  notes?: string;
  vehicleCondition?: string;
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
  minRentalDays?: number;
  depositAmount?: number;
  deliveryFee?: number;
  city: string;
  availabilityStatus: AvailabilityStatus;
  images?: string[];
  description?: string;
  active: boolean;
  maintenanceHistory?: MaintenanceRecord[];
  createdAt?: string;
  updatedAt?: string;
  agency?: Agency;
}
