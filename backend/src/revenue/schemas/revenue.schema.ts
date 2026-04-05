import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

export type RevenueDocument = Revenue & Document;

@Schema({ timestamps: true })
export class Revenue {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reservation', required: true })
  reservationId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  bookingReference: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agency', required: false })
  agencyId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Car', required: false })
  carId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number; // Final total amount

  @Prop({ required: true })
  baseAmount: number; // Rental days * daily price

  @Prop({ default: 0 })
  extrasTotal: number;

  @Prop({ default: 0 })
  insuranceFee: number;

  @Prop({ default: 0 })
  deliveryFee: number;

  @Prop({ default: 0 })
  taxAmount: number;

  @Prop({ default: 0 })
  commissionAmount: number;

  @Prop({ required: true })
  netAmount: number; // amount - commissionAmount

  @Prop({ required: true, default: Date.now })
  recognizedDate: Date;

  @Prop()
  paidAt?: Date;

  @Prop({
    type: String,
    enum: Object.values(PaymentMethod),
    required: false,
  })
  paymentMethod?: PaymentMethod;

  @Prop({
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PAID_ON_DELIVERY,
  })
  paymentStatus: PaymentStatus;

  @Prop({ default: 'AUTO' })
  source: string; // 'AUTO' or 'MANUAL'
  
  @Prop({ required: false })
  category?: string;

  @Prop({ required: false })
  description?: string;
}

export const RevenueSchema = SchemaFactory.createForClass(Revenue);

RevenueSchema.index({ agencyId: 1 });
RevenueSchema.index({ carId: 1 });
RevenueSchema.index({ recognizedDate: 1 });
RevenueSchema.index({ bookingReference: 1 });
RevenueSchema.index({ reservationId: 1 });
