import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { CarsService } from './cars.service';
import { FilterCarDto } from './dto/filter-car.dto';

@Controller('cars')
export class PublicCarsController {
  constructor(private readonly carsService: CarsService) {}

  @Get()
  async findAll(
    @Query() filterDto: FilterCarDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.carsService.findAll(filterDto, page, limit);
    return {
      count: result.count,
      cars: result.cars.map((car: any) => {
        const obj = car.toObject ? car.toObject() : car;
        delete obj.agencyId;
        return obj;
      }),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const car: any = await this.carsService.findById(id);
    const obj = car.toObject ? car.toObject() : car;
    delete obj.agencyId;
    return obj;
  }
}
