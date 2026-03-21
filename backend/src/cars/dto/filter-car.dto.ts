import { IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';
import {
  CarCategory,
  Transmission,
  AvailabilityStatus,
} from '../../common/enums/car.enum';

export class FilterCarDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsMongoId()
  agencyId?: string;

  @IsOptional()
  @IsEnum(Transmission)
  transmission?: Transmission;

  @IsOptional()
  @IsEnum(CarCategory)
  category?: CarCategory;

  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @IsOptional()
  @IsString()
  q?: string;
}
