import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsMongoId,
  IsInt,
  Min,
} from 'class-validator';
import {
  CarCategory,
  Transmission,
  FuelType,
  AvailabilityStatus,
} from '../../common/enums/car.enum';

export class CreateCarDto {
  @IsOptional()
  @IsMongoId()
  agencyId?: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  model: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsEnum(CarCategory)
  @IsNotEmpty()
  category: CarCategory;

  @IsEnum(Transmission)
  @IsNotEmpty()
  transmission: Transmission;

  @IsEnum(FuelType)
  @IsNotEmpty()
  fuelType: FuelType;

  @IsNumber()
  @IsNotEmpty()
  seats: number;

  @IsNumber()
  @IsOptional()
  luggage?: number;

  @IsNumber()
  @IsNotEmpty()
  dailyPrice: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  minRentalDays?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsNumber()
  @IsOptional()
  deliveryFee?: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(AvailabilityStatus)
  @IsOptional()
  availabilityStatus?: AvailabilityStatus;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
