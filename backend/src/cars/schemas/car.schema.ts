import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  AvailabilityStatus,
  CarCategory,
  FuelType,
  Transmission,
} from '../../common/enums/car.enum';

export type CarDocument = Car & Document;

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

  @Prop({ default: true })
  active: boolean;
}

export const CarSchema = SchemaFactory.createForClass(Car);

CarSchema.index({ agencyId: 1 });
CarSchema.index({ city: 1 });
CarSchema.index({ category: 1 });
CarSchema.index({ availabilityStatus: 1 });
