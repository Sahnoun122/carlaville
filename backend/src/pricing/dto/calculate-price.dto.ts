import { IsDateString, IsNumber, IsNotEmpty, IsBoolean } from 'class-validator';

export class CalculatePriceDto {
  @IsDateString()
  @IsNotEmpty()
  pickupDate: string;

  @IsDateString()
  @IsNotEmpty()
  returnDate: string;

  @IsNumber()
  @IsNotEmpty()
  dailyPrice: number;

  @IsNumber()
  @IsNotEmpty()
  deliveryFee: number;

  @IsBoolean()
  @IsNotEmpty()
  gps: boolean;

  @IsBoolean()
  @IsNotEmpty()
  childSeat: boolean;

  @IsBoolean()
  @IsNotEmpty()
  additionalDriver: boolean;
}
