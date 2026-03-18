import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  ReservationExtraBillingType,
  ReservationExtraScope,
} from '../schemas/reservation-day-control.schema';

export class UpdateReservationExtraOptionDto {
  @IsString()
  @Matches(/^[a-z0-9_-]{2,50}$/i)
  id: string;

  @IsString()
  @MinLength(2)
  label: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(ReservationExtraBillingType)
  billingType: ReservationExtraBillingType;

  @IsEnum(ReservationExtraScope)
  scope: ReservationExtraScope;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsMongoId({ each: true })
  carIds?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateDayControlSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  minRentalDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  maxRentalDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(730)
  maxAdvanceBookingDays?: number;

  @IsOptional()
  @IsBoolean()
  allowSameDayBooking?: boolean;

  @IsOptional()
  @IsArray()
  blockedWeekdays?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateReservationExtraOptionDto)
  extras?: UpdateReservationExtraOptionDto[];
}
