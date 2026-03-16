import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { AvailabilityStatus } from '../../common/enums/car.enum';

export class CompleteMaintenanceDto {
  @IsDateString()
  @IsOptional()
  endedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  finalCost?: number;

  @IsEnum(AvailabilityStatus)
  @IsOptional()
  nextAvailabilityStatus?: AvailabilityStatus;
}
