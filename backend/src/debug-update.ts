import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from './reservations/schemas/reservation.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reservationModel = app.get<Model<ReservationDocument>>(getModelToken(Reservation.name));
  
  const ref = 'CRVL-UXF4G9B9';
  console.log(`Checking reservation with reference: ${ref}`);
  
  const reservation = await reservationModel.findOne({ bookingReference: ref });
  if (!reservation) {
    console.log('Reservation not found');
  } else {
    console.log('Found reservation ID:', reservation._id);
    console.log('Current paymentStatus:', reservation.paymentStatus);
    console.log('Current stripePaymentIntentId:', reservation.stripePaymentIntentId);
    
    // Try to update
    const updated = await reservationModel.findByIdAndUpdate(reservation._id, {
      paymentStatus: 'paid',
      status: 'confirmed'
    }, { new: true });
    
    console.log('Updated reservation paymentStatus:', updated?.paymentStatus);
    console.log('Updated reservation status:', updated?.status);
  }
  
  await app.close();
}
bootstrap();
