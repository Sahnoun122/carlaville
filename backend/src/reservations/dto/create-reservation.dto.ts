import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsDateString,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @IsOptional()
  @IsMongoId()
  agencyId?: string;

  @IsMongoId()
  @IsNotEmpty()
  carId: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  returnLocation: string;

  @IsDateString()
  @IsNotEmpty()
  pickupDate: string;

  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @IsString()
  @IsNotEmpty()
  pickupTime: string;

  @IsString()
  @IsNotEmpty()
  returnTime: string;

  @IsArray()
  selectedExtras: string[];

  @IsObject()
  pricingBreakdown: Record<string, number>;
}
