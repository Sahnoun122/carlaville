import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PricingConfigDocument = PricingConfig & Document;

@Schema({ timestamps: true })
export class PricingConfig {
  @Prop({ required: true })
  platformCommissionPercent: number;

  @Prop({ required: true })
  insuranceFlatFee: number;

  @Prop({ required: true })
  gpsDailyFee: number;

  @Prop({ required: true })
  childSeatDailyFee: number;

  @Prop({ required: true })
  additionalDriverFlatFee: number;

  @Prop({ required: true })
  taxPercent: number;

  @Prop({ default: true })
  active: boolean;
}

export const PricingConfigSchema = SchemaFactory.createForClass(PricingConfig);
