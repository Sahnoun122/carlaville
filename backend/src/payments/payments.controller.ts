import { Controller, Post, Body, Headers, Req, Param } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createPaymentIntent(@Body('reservationId') reservationId: string) {
    return this.paymentsService.createPaymentIntent(reservationId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }

  @Post(':id/verify')
  async verifyPayment(@Param('id') id: string) {
    return this.paymentsService.verifyPayment(id);
  }

  @Post('confirm-pickup/:id')
  async confirmPickup(@Param('id') id: string) {
    return this.paymentsService.confirmPickup(id);
  }
}
