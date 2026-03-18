import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { AssignAgentDto } from './dto/assign-agent.dto';
import { AddNoteDto } from './dto/add-note.dto';
import { UpdateDayControlSettingsDto } from './dto/update-day-control-settings.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * @example POST http://localhost:3000/admin/reservations
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Post()
  create(@Body() createDto: CreateReservationDto) {
    return this.reservationsService.create(createDto);
  }

  /**
   * @example GET http://localhost:3000/admin/reservations?status=pending
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Get()
  findAll(
    @Query() filterDto: FilterReservationDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.reservationsService.findAll(filterDto, page, limit);
  }

  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Get('settings/day-control')
  getDayControlSettings() {
    return this.reservationsService.getDayControlSettings();
  }

  @Roles(Role.ADMIN)
  @Patch('settings/day-control')
  updateDayControlSettings(@Body() dto: UpdateDayControlSettingsDto) {
    return this.reservationsService.updateDayControlSettings(dto);
  }

  /**
   * @example GET http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findById(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/confirm
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/reject
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.reservationsService.reject(id);
  }

  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Patch(':id/pending')
  markPending(@Param('id') id: string) {
    return this.reservationsService.markPending(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/assign-agent
   */
  @Roles(Role.ADMIN)
  @Patch(':id/assign-agent')
  assignDeliveryAgent(
    @Param('id') id: string,
    @Body() assignAgentDto: AssignAgentDto,
  ) {
    return this.reservationsService.assignDeliveryAgent(
      id,
      assignAgentDto.agentId,
    );
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/ready-for-delivery
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Patch(':id/ready-for-delivery')
  markReadyForDelivery(@Param('id') id: string) {
    return this.reservationsService.markReadyForDelivery(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/delivered
   */
  @Roles(Role.DELIVERY_AGENT)
  @Patch(':id/delivered')
  markDelivered(@Param('id') id: string) {
    return this.reservationsService.markDelivered(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/returned
   */
  @Roles(Role.DELIVERY_AGENT)
  @Patch(':id/returned')
  markReturned(@Param('id') id: string) {
    return this.reservationsService.markReturned(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/complete
   */
  @Roles(Role.ADMIN)
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.reservationsService.complete(id);
  }

  /**
   * @example POST http://localhost:3000/admin/reservations/60f7e1b3b3b3b3b3b3b3b3b3/notes
   */
  @Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
  @Post(':id/notes')
  addInternalNote(@Param('id') id: string, @Body() addNoteDto: AddNoteDto) {
    return this.reservationsService.addInternalNote(id, addNoteDto.note);
  }
}
