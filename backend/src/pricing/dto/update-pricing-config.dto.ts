import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class UpdatePricingConfigDto {
  @IsNumber()
  @IsOptional()
  platformCommissionPercent?: number;

  @IsNumber()
  @IsOptional()
  insuranceFlatFee?: number;

  @IsNumber()
  @IsOptional()
  gpsDailyFee?: number;

  @IsNumber()
  @IsOptional()
  childSeatDailyFee?: number;

  @IsNumber()
  @IsOptional()
  additionalDriverFlatFee?: number;

  @IsNumber()
  @IsOptional()
  taxPercent?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
