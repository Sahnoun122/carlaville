import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReservationDayControlDocument = ReservationDayControl & Document;

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
}

export const ReservationDayControlSchema = SchemaFactory.createForClass(
  ReservationDayControl,
);
