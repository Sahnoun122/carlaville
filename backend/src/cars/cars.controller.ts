import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { FilterCarDto } from './dto/filter-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { StartMaintenanceDto } from './dto/start-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  /**
   * @example POST http://localhost:3000/admin/cars
   * @description Creates a new car.
   * @body {
   *   "agencyId": "60f7e1b3b3b3b3b3b3b3b3b3",
   *   "brand": "Toyota",
   *   "model": "Corolla",
   *   "year": 2022,
   *   "category": "midsize",
   *   "transmission": "automatic",
   *   "fuelType": "petrol",
   *   "seats": 5,
   *   "dailyPrice": 50,
   *   "city": "Rabat"
   * }
   * @returns The created car object.
   */
  @Post()
  create(@Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto);
  }

  /**
   * @example GET http://localhost:3000/admin/cars?page=1&limit=10&city=Rabat&category=suv
   * @description Returns a paginated list of cars with optional filters.
   * @returns { "cars": [...], "count": 1 }
   */
  @Get()
  findAll(
    @Query() filterDto: FilterCarDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.carsService.findAll(filterDto, page, limit);
  }

  /**
   * @example GET http://localhost:3000/admin/cars/60f7e1b3b3b3b3b3b3b3b3b3
   * @description Returns details for a single car.
   * @returns The car object.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findById(id);
  }

  /**
   * @example PATCH http://localhost:3000/admin/cars/60f7e1b3b3b3b3b3b3b3b3b3
   * @description Updates a car's details.
   * @body { "dailyPrice": 55 }
   * @returns The updated car object.
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(id, updateCarDto);
  }

  /**
   * @example DELETE http://localhost:3000/admin/cars/60f7e1b3b3b3b3b3b3b3b3b3
   * @description Archives (soft deletes) a car.
   * @returns The archived car object.
   */
  @Delete(':id')
  archive(@Param('id') id: string) {
    return this.carsService.archive(id);
  }

  @Patch(':id/maintenance/start')
  startMaintenance(
    @Param('id') id: string,
    @Body() startMaintenanceDto: StartMaintenanceDto,
  ) {
    return this.carsService.startMaintenance(id, startMaintenanceDto);
  }

  @Patch(':id/maintenance/complete')
  completeMaintenance(
    @Param('id') id: string,
    @Body() completeMaintenanceDto: CompleteMaintenanceDto,
  ) {
    return this.carsService.completeMaintenance(id, completeMaintenanceDto);
  }

  @Get(':id/maintenance/history')
  getMaintenanceHistory(@Param('id') id: string) {
    return this.carsService.getMaintenanceHistory(id);
  }
}
