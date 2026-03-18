import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsController } from './reservations.controller';
import { ClientReservationsController } from './client-reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import {
  ReservationDayControl,
  ReservationDayControlSchema,
} from './schemas/reservation-day-control.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      {
        name: ReservationDayControl.name,
        schema: ReservationDayControlSchema,
      },
    ]),
  ],
  controllers: [ReservationsController, ClientReservationsController],
  providers: [ReservationsService],
})

export class ReservationsModule {}
