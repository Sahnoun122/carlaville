import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  AvailabilityStatus,
  CarCategory,
  FuelType,
  Transmission,
} from '../../common/enums/car.enum';

export type CarDocument = Car & Document;

export class MaintenanceRecord {
  startedAt: Date;
  endedAt?: Date;
  reason: string;
  notes?: string;
  vehicleCondition?: string;
  estimatedCost?: number;
  finalCost?: number;
  status: 'ongoing' | 'completed';
}

@Schema({ timestamps: true })
export class Car {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Agency' })
  agencyId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({
    type: String,
    enum: Object.values(CarCategory),
    required: true,
  })
  category: CarCategory;

  @Prop({
    type: String,
    enum: Object.values(Transmission),
    required: true,
  })
  transmission: Transmission;

  @Prop({
    type: String,
    enum: Object.values(FuelType),
    required: true,
  })
  fuelType: FuelType;

  @Prop({ required: true })
  seats: number;

  @Prop()
  luggage: number;

  @Prop({ required: true })
  dailyPrice: number;

  @Prop({ min: 1 })
  minRentalDays?: number;

  @Prop()
  depositAmount: number;

  @Prop()
  deliveryFee: number;

  @Prop({ required: true })
  city: string;

  @Prop({
    type: String,
    enum: Object.values(AvailabilityStatus),
    default: AvailabilityStatus.AVAILABLE,
  })
  availabilityStatus: AvailabilityStatus;

  @Prop([String])
  images: string[];

  @Prop({
    type: [
      {
        startedAt: { type: Date, required: true },
        endedAt: { type: Date },
        reason: { type: String, required: true },
        notes: { type: String },
        vehicleCondition: { type: String },
        estimatedCost: { type: Number },
        finalCost: { type: Number },
        status: {
          type: String,
          enum: ['ongoing', 'completed'],
          required: true,
          default: 'ongoing',
        },
      },
    ],
    default: [],
  })
  maintenanceHistory: MaintenanceRecord[];

  @Prop({ default: true })
  active: boolean;
}

export const CarSchema = SchemaFactory.createForClass(Car);

CarSchema.index({ agencyId: 1 });
CarSchema.index({ city: 1 });
CarSchema.index({ category: 1 });
CarSchema.index({ availabilityStatus: 1 });
CarSchema.index({ 'maintenanceHistory.status': 1 });
