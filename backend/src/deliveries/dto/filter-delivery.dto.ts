import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { DeliveryStatus, DeliveryType } from '../../common/enums/delivery.enum';

export class FilterDeliveryDto {
  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;

  @IsOptional()
  @IsEnum(DeliveryType)
  type?: DeliveryType;

  @IsOptional()
  @IsMongoId()
  assignedAgentId?: string;

  @IsOptional()
  @IsMongoId()
  reservationId?: string;
}
