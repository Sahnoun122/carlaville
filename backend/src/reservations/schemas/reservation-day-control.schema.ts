import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDayControlDocument = ReservationDayControl & Document;

export enum ReservationExtraBillingType {
  PER_DAY = 'PER_DAY',
  PER_RENTAL = 'PER_RENTAL',
}

export enum ReservationExtraScope {
  ALL_CARS = 'ALL_CARS',
  SELECTED_CARS = 'SELECTED_CARS',
}

export class ReservationExtraOption {
  id: string;
  label: string;
  price: number;
  billingType: ReservationExtraBillingType;
  scope: ReservationExtraScope;
  carIds: string[];
  active: boolean;
}

@Schema({ timestamps: true })
export class ReservationDayControl {
  @Prop({ required: true, default: 1 })
  minRentalDays: number;

  @Prop({ required: true, default: 30 })
  maxRentalDays: number;

  @Prop({ required: true, default: 365 })
  maxAdvanceBookingDays: number;

  @Prop({ required: true, default: true })
  allowSameDayBooking: boolean;

  @Prop({ type: [Number], default: [] })
  blockedWeekdays: number[];

  @Prop({
    type: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        billingType: {
          type: String,
          enum: Object.values(ReservationExtraBillingType),
          required: true,
          default: ReservationExtraBillingType.PER_DAY,
        },
        scope: {
          type: String,
          enum: Object.values(ReservationExtraScope),
          required: true,
          default: ReservationExtraScope.ALL_CARS,
        },
        carIds: { type: [String], default: [] },
        active: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  extras: ReservationExtraOption[];
}

export const ReservationDayControlSchema = SchemaFactory.createForClass(
  ReservationDayControl,
);
