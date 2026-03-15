import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerEmail: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Car', required: true })
  carId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  returnLocation: string;

  @Prop({ required: true })
  pickupDate: Date;

  @Prop({ required: true })
  returnDate: Date;

  @Prop({ required: true })
  pickupTime: string;

  @Prop({ required: true })
  returnTime: string;

  @Prop({ required: true })
  rentalDays: number;

  @Prop([String])
  selectedExtras: string[];

  @Prop({ type: Object })
  pricingBreakdown: Record<string, number>;

  @Prop({
    type: String,
    enum: Object.values(ReservationStatus),
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedDeliveryAgentId: MongooseSchema.Types.ObjectId;

  @Prop()
  internalNotes: string;

  @Prop({ required: true, unique: true })
  bookingReference: string;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

ReservationSchema.index({ bookingReference: 1 });
ReservationSchema.index({ agencyId: 1 });
ReservationSchema.index({ carId: 1 });
ReservationSchema.index({ assignedDeliveryAgentId: 1 });
ReservationSchema.index({ pickupDate: 1 });
ReservationSchema.index({ returnDate: 1 });
