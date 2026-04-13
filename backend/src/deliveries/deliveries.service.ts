import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery, DeliveryDocument } from './schemas/delivery.schema';
import { Reservation, ReservationDocument } from '../reservations/schemas/reservation.schema';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { FilterDeliveryDto } from './dto/filter-delivery.dto';
import { UpdateDeliveryStatusDto } from './dto/update-delivery-status.dto';
import { DeliveryStatus, DeliveryType } from '../common/enums/delivery.enum';
import { ReservationsService } from '../reservations/reservations.service';

const allowedTransitions: Partial<Record<DeliveryStatus, DeliveryStatus[]>> = {
	[DeliveryStatus.PENDING]: [
		DeliveryStatus.ASSIGNED,
		DeliveryStatus.ON_THE_WAY,
		DeliveryStatus.CANCELLED,
	],
	[DeliveryStatus.ASSIGNED]: [
		DeliveryStatus.ON_THE_WAY,
		DeliveryStatus.CANCELLED,
		DeliveryStatus.FAILED,
	],
	[DeliveryStatus.ON_THE_WAY]: [DeliveryStatus.ARRIVED, DeliveryStatus.FAILED],
	[DeliveryStatus.ARRIVED]: [DeliveryStatus.CONFIRMED, DeliveryStatus.FAILED],
};

@Injectable()
export class DeliveriesService {
	constructor(
		@InjectModel(Delivery.name)
		private deliveryModel: Model<DeliveryDocument>,
		@InjectModel(Reservation.name)
		private reservationModel: Model<ReservationDocument>,
		private readonly reservationsService: ReservationsService,
	) {}

	async create(createDeliveryDto: CreateDeliveryDto): Promise<Delivery> {
		const reservation = await this.reservationModel
			.findById(createDeliveryDto.reservationId)
			.exec();

		if (!reservation) {
			throw new NotFoundException('Reservation not found for this delivery.');
		}

		const existingOpenDelivery = await this.deliveryModel
			.findOne({
				reservationId: createDeliveryDto.reservationId,
				type: createDeliveryDto.type,
				status: { $nin: [DeliveryStatus.CONFIRMED, DeliveryStatus.CANCELLED] },
			} as unknown as Record<string, unknown>)
			.exec();

		if (existingOpenDelivery) {
			throw new BadRequestException(
				'An active delivery for this reservation and type already exists.',
			);
		}

		const delivery = new this.deliveryModel({
			...createDeliveryDto,
			scheduledDate: new Date(createDeliveryDto.scheduledDate),
			status: DeliveryStatus.ASSIGNED,
		} as unknown as Record<string, unknown>);
		await delivery.save();

		reservation.assignedDeliveryAgentId = createDeliveryDto.assignedAgentId as never;

		if (createDeliveryDto.type === DeliveryType.PICKUP) {
			await this.reservationsService.markReadyForDelivery(
				createDeliveryDto.reservationId,
			);
		}

		if (createDeliveryDto.type === DeliveryType.RETURN) {
			await this.reservationsService.markReturnScheduled(
				createDeliveryDto.reservationId,
			);
		}

		await reservation.save();

		return this.findById(String((delivery as { _id?: unknown })._id));
	}

	async findAll(filterDto: FilterDeliveryDto, page: number, limit: number) {
		const query: Record<string, unknown> = {};

		if (filterDto.status) {
			query.status = filterDto.status;
		}
		if (filterDto.type) {
			query.type = filterDto.type;
		}
		if (filterDto.assignedAgentId) {
			query.assignedAgentId = filterDto.assignedAgentId;
		}
		if (filterDto.reservationId) {
			query.reservationId = filterDto.reservationId;
		}

		const deliveries = await this.deliveryModel
			.find(query)
			.populate('reservationId', 'bookingReference customerName pickupLocation returnLocation status')
			.populate('assignedAgentId', 'name email')
			.populate('confirmedBy', 'name email')
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.exec();

		const count = await this.deliveryModel.countDocuments(query);
		return { deliveries, count };
	}

	async findMine(
		agentId: string,
		filterDto: FilterDeliveryDto,
		page: number,
		limit: number,
	) {
		return this.findAll(
			{
				...filterDto,
				assignedAgentId: agentId,
			},
			page,
			limit,
		);
	}

	async findById(id: string): Promise<Delivery> {
		const delivery = await this.deliveryModel
			.findById(id)
			.populate('reservationId', 'bookingReference customerName pickupLocation returnLocation status')
			.populate('assignedAgentId', 'name email')
			.populate('confirmedBy', 'name email')
			.exec();

		if (!delivery) {
			throw new NotFoundException(`Delivery with id ${id} not found.`);
		}

		return delivery;
	}

	async updateStatusByAgent(
		id: string,
		agentId: string,
		updateDto: UpdateDeliveryStatusDto,
	): Promise<Delivery> {
		const delivery = await this.deliveryModel.findById(id).exec();

		if (!delivery) {
			throw new NotFoundException(`Delivery with id ${id} not found.`);
		}

		if (String(delivery.assignedAgentId) !== agentId) {
			throw new BadRequestException('This delivery is not assigned to you.');
		}

		this.assertTransitionAllowed(delivery.status as DeliveryStatus, updateDto.status);

		delivery.status = updateDto.status;

		if (updateDto.notes) {
			delivery.notes = delivery.notes
				? `${delivery.notes}\n${updateDto.notes}`
				: updateDto.notes;
		}

		if (updateDto.gpsLocation) {
			delivery.gpsLocation = updateDto.gpsLocation;
		}

		if (updateDto.checklist) {
			delivery.checklist = updateDto.checklist;
		}

		if (updateDto.status === DeliveryStatus.CONFIRMED) {
			delivery.actualDateTime = new Date();
			delivery.confirmedBy = agentId as never;

			if (delivery.type === DeliveryType.PICKUP) {
				await this.reservationsService.markActiveRental(
					String(delivery.reservationId),
				);
			} else {
				await this.reservationsService.markReturned(
					String(delivery.reservationId),
				);
			}
		}

		if (updateDto.status === DeliveryStatus.ON_THE_WAY) {
			if (delivery.type === DeliveryType.PICKUP) {
				await this.reservationsService.markInDelivery(
					String(delivery.reservationId),
				);
			}
		}

		if (updateDto.status === DeliveryStatus.ARRIVED) {
			if (delivery.type === DeliveryType.PICKUP) {
				// This step now auto-validates cash payment and recognizes revenue.
				await this.reservationsService.markDelivered(String(delivery.reservationId));
			}
		}

		await delivery.save();

		return this.findById(id);
	}

	private assertTransitionAllowed(current: DeliveryStatus, next: DeliveryStatus) {
		if (current === next) {
			return;
		}

		const allowed = allowedTransitions[current] || [];
		if (!allowed.includes(next)) {
			throw new ConflictException(
				`Cannot transition delivery from ${current} to ${next}`,
			);
		}
	}
}
