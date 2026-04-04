import { Car } from './car';
import { Agency } from './agency';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
  READY_FOR_DELIVERY = 'ready-for-delivery',
  IN_DELIVERY = 'in-delivery',
  DELIVERED = 'delivered',
  ACTIVE_RENTAL = 'active-rental',
  RETURN_SCHEDULED = 'return-scheduled',
  RETURNED = 'returned',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Reservation {
  id?: string;
  _id?: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  agencyId: string | Agency;
  carId: string | Car;
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  rentalDays: number;
  selectedExtras?: string[];
  pricingBreakdown?: Record<string, number>;
  status: ReservationStatus;
  paymentStatus: 'unpaid' | 'paid-on-delivery' | 'refunded' | 'partially-paid' | 'failed';
  paymentMethod?: 'cash' | 'bank-transfer' | 'credit-card' | 'online';
  amountCollected?: number;
  paidAt?: string;
  stripePaymentIntentId?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReservationListResponse {
  reservations: Reservation[];
  count: number;
}
