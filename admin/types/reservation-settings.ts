export interface ReservationDayControlSettings {
  id: string;
  minRentalDays: number;
  maxRentalDays: number;
  maxAdvanceBookingDays: number;
  allowSameDayBooking: boolean;
  blockedWeekdays: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateReservationDayControlSettingsPayload {
  minRentalDays?: number;
  maxRentalDays?: number;
  maxAdvanceBookingDays?: number;
  allowSameDayBooking?: boolean;
  blockedWeekdays?: number[];
}
