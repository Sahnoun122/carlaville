import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import {
  CarCategory,
  Transmission,
  FuelType,
  AvailabilityStatus,
} from '../../common/enums/car.enum';

export class UpdateCarDto {
  @IsOptional()
  @IsMongoId()
  agencyId?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(CarCategory)
  category?: CarCategory;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsNumber()
  luggage?: number;

  @IsOptional()
  @IsNumber()
  dailyPrice?: number;

  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availabilityStatus?: AvailabilityStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
