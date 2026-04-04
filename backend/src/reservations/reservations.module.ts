import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ClientReservationsController } from './client-reservations.controller';
import { PublicReservationsController } from './public-reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import {
  ReservationDayControl,
  ReservationDayControlSchema,
} from './schemas/reservation-day-control.schema';
import { Car, CarSchema } from '../cars/schemas/car.schema';
import { RevenueModule } from '../revenue/revenue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      {
        name: ReservationDayControl.name,
        schema: ReservationDayControlSchema,
      },
      {
        name: Car.name,
        schema: CarSchema,
      },
    ]),
    RevenueModule,
  ],
  controllers: [
    ReservationsController,
    ClientReservationsController,
    PublicReservationsController,
  ],
  providers: [ReservationsService],
})

export class ReservationsModule {}
