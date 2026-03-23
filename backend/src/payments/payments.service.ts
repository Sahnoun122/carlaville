import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Reservation, ReservationDocument } from '../reservations/schemas/reservation.schema';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY')!;
    this.stripe = new Stripe(stripeSecretKey);
  }

  async createPaymentIntent(reservationId: string) {
    const reservation = await this.reservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${reservationId} not found`);
    }

    if (reservation.paymentStatus === 'paid') {
      throw new BadRequestException('Reservation is already paid');
    }

    const amount = Math.round(reservation.pricingBreakdown.total * 100); // Stripe expects amount in cents

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'mad',
      metadata: {
        reservationId: reservation._id.toString(),
        bookingReference: reservation.bookingReference,
      },
    });

    await this.reservationModel.findByIdAndUpdate(reservationId, {
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  async handleWebhook(payload: any, signature: string) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!;
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const reservationId = paymentIntent.metadata.reservationId;

      const reservation = await this.reservationModel.findById(reservationId);
      if (reservation) {
        await this.reservationModel.findByIdAndUpdate(reservationId, {
          paymentStatus: 'paid',
          status: 'confirmed' as any,
        });
        this.logger.log(`Payment confirmed for reservation ${reservationId}`);
      }
    }

    return { received: true };
  }

  async verifyPayment(reservationId: string) {
    this.logger.log(`Verifying payment for reservation: ${reservationId}`);
    const reservation = await this.reservationModel.findById(reservationId);
    if (!reservation) {
      this.logger.error(`Reservation not found: ${reservationId}`);
      throw new NotFoundException(`Reservation with id ${reservationId} not found`);
    }

    if (reservation.paymentStatus === 'paid') {
      this.logger.log(`Reservation ${reservationId} already paid`);
      return { success: true, status: 'paid' };
    }

    if (!reservation.stripePaymentIntentId) {
      this.logger.error(`No payment intent for reservation: ${reservationId}`);
      throw new BadRequestException('No payment intent found for this reservation');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(reservation.stripePaymentIntentId);
      this.logger.log(`Stripe PaymentIntent status for ${reservationId}: ${paymentIntent.status}`);

      if (paymentIntent.status === 'succeeded') {
        await this.reservationModel.findByIdAndUpdate(reservationId, {
          paymentStatus: 'paid',
          status: 'confirmed' as any,
        });
        this.logger.log(`Payment confirmed and marked as PAID for ${reservationId}`);
        return { success: true, status: 'paid' };
      }

      return { success: false, status: paymentIntent.status };
    } catch (err) {
      this.logger.error(`Failed to retrieve payment intent from Stripe: ${err.message}`);
      throw new BadRequestException(`Stripe Error: ${err.message}`);
    }
  }
}
