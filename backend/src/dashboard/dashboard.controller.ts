import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Roles(Role.ADMIN, Role.RESERVATION_MANAGER)
	@Get('reservation-manager')
	getReservationManagerDashboard() {
		return this.dashboardService.getReservationManagerStats();
	}
}
