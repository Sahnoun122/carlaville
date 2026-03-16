import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { DeliveryStatus } from '../../common/enums/delivery.enum';

export class UpdateDeliveryStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  gpsLocation?: string;

  @IsOptional()
  @IsObject()
  checklist?: Record<string, boolean>;
}
