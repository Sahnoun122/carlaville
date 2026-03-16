import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeliveryType } from '../../common/enums/delivery.enum';

export class CreateDeliveryDto {
  @IsMongoId()
  @IsNotEmpty()
  reservationId: string;

  @IsMongoId()
  @IsNotEmpty()
  assignedAgentId: string;

  @IsEnum(DeliveryType)
  @IsNotEmpty()
  type: DeliveryType;

  @IsDateString()
  @IsNotEmpty()
  scheduledDate: string;

  @IsString()
  @IsNotEmpty()
  scheduledTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
