import {
	Body,
	Controller,
	DefaultValuePipe,
	Get,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
	Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { DeliveriesService } from './deliveries.service';
import { FilterDeliveryDto } from './dto/filter-delivery.dto';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DeliveriesController {
	constructor(private readonly deliveriesService: DeliveriesService) {}

	@Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
	@Get('admin/deliveries')
	findAllAdmin(
		@Query() filterDto: FilterDeliveryDto,
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
	) {
		return this.deliveriesService.findAll(filterDto, page, limit);
	}

	@Roles(Role.ADMIN)
	@Post('admin/deliveries')
	create(@Body() createDto: CreateDeliveryDto) {
		return this.deliveriesService.create(createDto);
	}

	@Roles(Role.DELIVERY_AGENT)
	@Get('operations/deliveries')
	findMine(
		@CurrentUser() user: AuthenticatedUser,
		@Query() filterDto: FilterDeliveryDto,
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
	) {
		return this.deliveriesService.findMine(user.id, filterDto, page, limit);
	}

	@Roles(Role.DELIVERY_AGENT)
	@Patch('operations/deliveries/:id/status')
	updateStatus(
		@Param('id') id: string,
		@CurrentUser() user: AuthenticatedUser,
		@Body() updateDto: UpdateDeliveryStatusDto,
	) {
		return this.deliveriesService.updateStatusByAgent(id, user.id, updateDto);
	}
}
