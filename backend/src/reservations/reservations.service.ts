import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from './schemas/reservation.schema';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { customAlphabet } from 'nanoid';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
  ) {}

  private readonly nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const bookingReference = `CRVL-${this.nanoid()}`;
    const rentalDays = this.calculateRentalDays(dto.pickupDate, dto.returnDate);

    const reservation = new this.reservationModel({
      ...dto,
      bookingReference,
      rentalDays,
      status: ReservationStatus.PENDING,
    });
    return reservation.save();
  }

  async findAll(filterDto: FilterReservationDto, page: number, limit: number) {
    const query: any = {};
    if (filterDto.status) query.status = filterDto.status;
    if (filterDto.agencyId) query.agencyId = filterDto.agencyId;
    if (filterDto.carId) query.carId = filterDto.carId;
    if (filterDto.bookingReference)
      query.bookingReference = filterDto.bookingReference;
    if (filterDto.date) {
      const searchDate = new Date(filterDto.date);
      query.pickupDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
      };
    }

    const reservations = await this.reservationModel
      .find(query)
      .populate('agencyId', 'name')
      .populate('carId', 'brand model')
      .populate('assignedDeliveryAgentId', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const count = await this.reservationModel.countDocuments(query);
    return { reservations, count };
  }

  async findById(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('agencyId')
      .populate('carId')
      .populate('assignedDeliveryAgentId')
      .exec();
    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }
    return reservation;
  }

  async confirm(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.CONFIRMED, [
      ReservationStatus.PENDING,
    ]);
  }

  async reject(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.REJECTED, [
      ReservationStatus.PENDING,
    ]);
  }

  async assignDeliveryAgent(
    id: string,
    agentId: string,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Cannot assign agent to a non-confirmed reservation.',
      );
    }
    reservation.assignedDeliveryAgentId = agentId as any;
    return reservation.save();
  }

  async markReadyForDelivery(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.READY_FOR_DELIVERY, [
      ReservationStatus.CONFIRMED,
    ]);
  }

  async markDelivered(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.DELIVERED, [
      ReservationStatus.IN_DELIVERY,
    ]);
  }

  async markReturned(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.RETURNED, [
      ReservationStatus.ACTIVE_RENTAL,
      ReservationStatus.RETURN_SCHEDULED,
    ]);
  }

  async complete(id: string): Promise<Reservation> {
    return this.updateStatus(id, ReservationStatus.COMPLETED, [
      ReservationStatus.RETURNED,
    ]);
  }

  async addInternalNote(id: string, note: string): Promise<Reservation> {
    const reservation = await this.findById(id);
    reservation.internalNotes = reservation.internalNotes
      ? `${reservation.internalNotes}\n${note}`
      : note;
    return reservation.save();
  }

  private async updateStatus(
    id: string,
    newStatus: ReservationStatus,
    allowedInitialStatuses: ReservationStatus[],
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
    if (!allowedInitialStatuses.includes(reservation.status)) {
      throw new ConflictException(
        `Cannot transition from ${reservation.status} to ${newStatus}`,
      );
    }
    reservation.status = newStatus;
    return reservation.save();
  }

  private calculateRentalDays(pickupDate: string, returnDate: string): number {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  }
}
