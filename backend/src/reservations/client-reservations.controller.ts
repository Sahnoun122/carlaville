import { Controller, UseGuards, Post, Body, Get, Query, Param, DefaultValuePipe, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

const normalizeEmail = (value?: string) => value?.trim().toLowerCase() || '';
const normalizePhone = (value?: string) => (value || '').replace(/\D+/g, '');

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CLIENT, Role.ADMIN)
@Controller('client/reservations')
export class ClientReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() createDto: CreateReservationDto, @CurrentUser() user: AuthenticatedUser) {
    createDto.customerEmail = normalizeEmail(user.email);
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
    filterDto.customerEmail = normalizeEmail(user.email);
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
    const reservationEmail = normalizeEmail((reservation as any).customerEmail);
    const userEmail = normalizeEmail(user.email);
    const reservationPhone = normalizePhone((reservation as any).customerPhone);
    const userPhone = normalizePhone(user.phone);
    const hasEmailMatch = reservationEmail.length > 0 && reservationEmail === userEmail;
    const hasPhoneFallbackMatch = reservationEmail.length === 0 && reservationPhone.length > 0 && reservationPhone === userPhone;

    if (user.role !== Role.ADMIN && !hasEmailMatch && !hasPhoneFallbackMatch) {
      throw new ForbiddenException('Accès refusé');
    }

    return reservation;
  }
}
