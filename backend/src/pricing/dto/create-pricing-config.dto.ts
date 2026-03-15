import { IsNumber, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreatePricingConfigDto {
  @IsNumber()
  @IsNotEmpty()
  platformCommissionPercent: number;

  @IsNumber()
  @IsNotEmpty()
  insuranceFlatFee: number;

  @IsNumber()
  @IsNotEmpty()
  gpsDailyFee: number;

  @IsNumber()
  @IsNotEmpty()
  childSeatDailyFee: number;

  @IsNumber()
  @IsNotEmpty()
  additionalDriverFlatFee: number;

  @IsNumber()
  @IsNotEmpty()
  taxPercent: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
