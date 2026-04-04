import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RevenueService } from './revenue.service';
import { CreateRevenueDto, UpdateRevenueDto } from './dto/create-revenue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('revenue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new revenue entry' })
  create(@Body() createRevenueDto: CreateRevenueDto) {
    return this.revenueService.create(createRevenueDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all revenue entries' })
  findAll(
    @Query('agencyId') agencyId?: string,
    @Query('carId') carId?: string,
  ) {
    const filter: any = {};
    if (agencyId) filter.agencyId = agencyId;
    if (carId) filter.carId = carId;
    return this.revenueService.findAll(filter);
  }

  @Get('summary')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get revenue summary' })
  getSummary(
    @Query('agencyId') agencyId?: string,
    @Query('carId') carId?: string,
  ) {
    return this.revenueService.getSummary(agencyId, carId);
  }

  @Get('analytics/timeframe')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get time-based revenue analytics' })
  getTimeframeAnalytics(@Query('agencyId') agencyId?: string) {
    return this.revenueService.getTimeframeAnalytics(agencyId);
  }

  @Get('rankings')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get revenue rankings for cars and agencies' })
  getRankings() {
    return this.revenueService.getRankings();
  }

  @Get('turnover')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get turnover breakdown by agency and cars' })
  getTurnoverBreakdown(@Query('agencyId') agencyId?: string) {
    return this.revenueService.getTurnoverBreakdown(agencyId);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a revenue entry by ID' })
  findOne(@Param('id') id: string) {
    return this.revenueService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a revenue entry' })
  update(@Param('id') id: string, @Body() updateRevenueDto: UpdateRevenueDto) {
    return this.revenueService.update(id, updateRevenueDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a revenue entry' })
  remove(@Param('id') id: string) {
    return this.revenueService.remove(id);
  }
}
