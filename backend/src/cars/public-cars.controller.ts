import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CarsService } from './cars.service';
import { FilterCarDto } from './dto/filter-car.dto';

@Controller('cars')
export class PublicCarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  findAll(
    @Query() filterDto: FilterCarDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.carsService.findAll(filterDto, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findById(id);
  }
}
