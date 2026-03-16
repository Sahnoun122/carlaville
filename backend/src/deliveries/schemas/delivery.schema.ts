import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { DeliveryStatus, DeliveryType } from '../../common/enums/delivery.enum';

export type DeliveryDocument = Delivery & Document;

@Schema({ timestamps: true })
export class Delivery {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
  })
  reservationId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedAgentId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(DeliveryType),
    required: true,
  })
  type: DeliveryType;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ required: true })
  scheduledTime: string;

  @Prop()
  actualDateTime: Date;

  @Prop({
    type: String,
    enum: Object.values(DeliveryStatus),
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Prop([String])
  proofPhotos: string[];

  @Prop()
  gpsLocation: string;

  @Prop()
  notes: string;

  @Prop({ type: Object })
  checklist: Record<string, boolean>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  confirmedBy: MongooseSchema.Types.ObjectId;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);

DeliverySchema.index({ reservationId: 1 });
DeliverySchema.index({ assignedAgentId: 1 });
DeliverySchema.index({ status: 1 });
