import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class StartMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  vehicleCondition?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedCost?: number;
}
