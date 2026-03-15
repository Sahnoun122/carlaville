import {
  IsOptional,
  IsString,
  IsEnum,
  IsMongoId,
  IsDateString,
} from 'class-validator';
import { ReservationStatus } from '../../common/enums/reservation-status.enum';

export class FilterReservationDto {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsMongoId()
  agencyId?: string;

  @IsOptional()
  @IsMongoId()
  carId?: string;

  @IsOptional()
  @IsString()
  bookingReference?: string;
}
