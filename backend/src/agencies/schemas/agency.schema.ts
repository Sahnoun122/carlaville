import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AgencyStatus } from '../../common/enums/agency-status.enum';

export type AgencyDocument = Agency & Document;

@Schema({ timestamps: true })
export class Agency {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  contactPerson: string;

  @Prop({
    type: String,
    enum: Object.values(AgencyStatus),
    default: AgencyStatus.PENDING,
  })
  status: AgencyStatus;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 15 })
  commissionRate: number;
}

export const AgencySchema = SchemaFactory.createForClass(Agency);

AgencySchema.index({ email: 1 });
AgencySchema.index({ city: 1 });
