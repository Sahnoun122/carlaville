import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from './schemas/car.schema';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { FilterCarDto } from './dto/filter-car.dto';

@Injectable()
export class CarsService {
  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async create(createCarDto: CreateCarDto): Promise<Car> {
    const createdCar = new this.carModel(createCarDto);
    return createdCar.save();
  }

  async findAll(filterDto: FilterCarDto, page: number, limit: number) {
    const query: any = { active: { $ne: false } }; // Exclude archived cars by default

    if (filterDto.city) {
      query.city = filterDto.city;
    }
    if (filterDto.agencyId) {
      query.agencyId = filterDto.agencyId;
    }
    if (filterDto.transmission) {
      query.transmission = filterDto.transmission;
    }
    if (filterDto.category) {
      query.category = filterDto.category;
    }
    if (filterDto.availability) {
      query.availabilityStatus = filterDto.availability;
    }

    const cars = await this.carModel
      .find(query)
      .populate('agencyId', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const count = await this.carModel.countDocuments(query);
    return { cars, count };
  }

  async findById(id: string): Promise<Car> {
    const car = await this.carModel.findById(id).populate('agencyId').exec();
    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return car;
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<Car> {
    const updatedCar = await this.carModel
      .findByIdAndUpdate(id, updateCarDto, { new: true })
      .exec();
    if (!updatedCar) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return updatedCar;
  }

  async archive(id: string): Promise<Car> {
    const archivedCar = await this.carModel
      .findByIdAndUpdate(id, { active: false }, { new: true })
      .exec();
    if (!archivedCar) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }
    return archivedCar;
  }
}
