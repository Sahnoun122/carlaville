import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from './schemas/car.schema';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { FilterCarDto } from './dto/filter-car.dto';
import { StartMaintenanceDto } from './dto/start-maintenance.dto';
import { CompleteMaintenanceDto } from './dto/complete-maintenance.dto';
import { AvailabilityStatus } from '../common/enums/car.enum';

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
    if (filterDto.q) {
      query.$or = [
        { brand: { $regex: filterDto.q, $options: 'i' } },
        { model: { $regex: filterDto.q, $options: 'i' } },
        { city: { $regex: filterDto.q, $options: 'i' } },
      ];
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

  async startMaintenance(
    id: string,
    startMaintenanceDto: StartMaintenanceDto,
  ): Promise<Car> {
    const car = await this.carModel.findById(id).exec();

    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    const hasOngoingMaintenance = car.maintenanceHistory?.some(
      (record) => record.status === 'ongoing',
    );

    if (
      hasOngoingMaintenance ||
      car.availabilityStatus === AvailabilityStatus.MAINTENANCE
    ) {
      throw new BadRequestException('Car is already in maintenance.');
    }

    car.maintenanceHistory = car.maintenanceHistory || [];
    car.maintenanceHistory.push({
      startedAt: new Date(),
      reason: startMaintenanceDto.reason,
      notes: startMaintenanceDto.notes,
      vehicleCondition: startMaintenanceDto.vehicleCondition,
      estimatedCost: startMaintenanceDto.estimatedCost,
      status: 'ongoing',
    } as never);

    car.availabilityStatus = AvailabilityStatus.MAINTENANCE;

    await car.save();

    return this.findById(id);
  }

  async completeMaintenance(
    id: string,
    completeMaintenanceDto: CompleteMaintenanceDto,
  ): Promise<Car> {
    const car = await this.carModel.findById(id).exec();

    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    const ongoingIndex = car.maintenanceHistory
      ? [...car.maintenanceHistory]
          .reverse()
          .findIndex((record) => record.status === 'ongoing')
      : -1;

    if (ongoingIndex === -1) {
      throw new BadRequestException(
        'No ongoing maintenance found for this car.',
      );
    }

    const realIndex = car.maintenanceHistory.length - 1 - ongoingIndex;
    const targetRecord = car.maintenanceHistory[realIndex] as never as {
      endedAt?: Date;
      notes?: string;
      vehicleCondition?: string;
      finalCost?: number;
      status: 'ongoing' | 'completed';
    };

    targetRecord.endedAt = completeMaintenanceDto.endedAt
      ? new Date(completeMaintenanceDto.endedAt)
      : new Date();

    if (completeMaintenanceDto.notes) {
      targetRecord.notes = completeMaintenanceDto.notes;
    }

    if (typeof completeMaintenanceDto.finalCost === 'number') {
      targetRecord.finalCost = completeMaintenanceDto.finalCost;
    }

    if (completeMaintenanceDto.vehicleCondition) {
      targetRecord.vehicleCondition = completeMaintenanceDto.vehicleCondition;
    }

    targetRecord.status = 'completed';

    car.availabilityStatus =
      completeMaintenanceDto.nextAvailabilityStatus ||
      AvailabilityStatus.AVAILABLE;

    await car.save();

    return this.findById(id);
  }

  async getMaintenanceHistory(id: string) {
    const car = await this.carModel
      .findById(id)
      .select('maintenanceHistory brand model availabilityStatus')
      .exec();

    if (!car) {
      throw new NotFoundException(`Car with id ${id} not found`);
    }

    const history = [...(car.maintenanceHistory || [])].sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );

    return {
      carId: id,
      carLabel: `${car.brand} ${car.model}`,
      availabilityStatus: car.availabilityStatus,
      history,
    };
  }
}
