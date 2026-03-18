export type ReservationExtraBillingType = 'PER_DAY' | 'PER_RENTAL';
export type ReservationExtraScope = 'ALL_CARS' | 'SELECTED_CARS';

export interface ReservationExtraOption {
  id: string;
  label: string;
  price: number;
  billingType: ReservationExtraBillingType;
  scope: ReservationExtraScope;
  carIds: string[];
  active: boolean;
}

export interface ReservationDayControlSettings {
  id: string;
  minRentalDays: number;
  maxRentalDays: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
  blockedWeekdays: number[];
  extras: ReservationExtraOption[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateReservationDayControlSettingsPayload {
  minRentalDays?: number;
  maxRentalDays?: number;
  maxAdvanceBookingDays?: number;
  allowSameDayBooking?: boolean;
  blockedWeekdays?: number[];
  extras?: ReservationExtraOption[];
}
