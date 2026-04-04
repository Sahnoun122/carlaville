import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../common/enums/payment-method.enum';

export class ConfirmPaymentDto {
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod = PaymentMethod.CASH;

  @IsNumber()
  @Type(() => Number)
  amountCollected: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
