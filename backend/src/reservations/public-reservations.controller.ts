import { Controller, Get } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class PublicReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('settings/day-control')
  getDayControlSettings() {
    return this.reservationsService.getDayControlSettings();
  }
}
