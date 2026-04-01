import { Controller, UseGuards, Post, Body, Get, Query, Param, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT, Role.ADMIN)
@Controller('client/reservations')
export class ClientReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createDto: CreateReservationDto, @CurrentUser() user: AuthenticatedUser) {
    createDto.customerEmail = user.email;
    if (!createDto.customerName) {
      createDto.customerName = user.name || 'Client';
    }
    return this.reservationsService.create(createDto);
  }

  @Get()
  async findMyReservations(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filterDto: FilterReservationDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    filterDto.customerEmail = user.email;
    const result = await this.reservationsService.findAll(filterDto, page, limit);
    
    return {
      count: result.count,
      reservations: result.reservations.map((res: any) => {
        const obj = res.toObject ? res.toObject() : res;
        delete obj.agencyId;
        return obj;
      }),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const reservation = await this.reservationsService.findById(id);
    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }
    
    // Check if the reservation belongs to the user
    if (reservation.customerEmail !== user.email) {
      throw new Error('Accès refusé');
    }

    return reservation;
  }
}
