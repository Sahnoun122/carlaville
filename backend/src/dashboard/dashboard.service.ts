import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../reservations/schemas/reservation.schema';
import { Car, CarDocument } from '../cars/schemas/car.schema';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { AvailabilityStatus } from '../common/enums/car.enum';

@Injectable()
export class DashboardService {
	constructor(
		@InjectModel(Reservation.name)
		private readonly reservationModel: Model<ReservationDocument>,
		@InjectModel(Car.name)
		private readonly carModel: Model<CarDocument>,
	) {}

	async getReservationManagerStats() {
		const [
			totalReservations,
			pendingReservations,
			confirmedReservations,
			activeRentals,
			todayPickups,
			todayReturns,
			maintenanceCars,
			recentReservations,
		] = await Promise.all([
			this.reservationModel.countDocuments(),
			this.reservationModel.countDocuments({ status: ReservationStatus.PENDING }),
			this.reservationModel.countDocuments({ status: ReservationStatus.CONFIRMED }),
			this.reservationModel.countDocuments({ status: ReservationStatus.ACTIVE_RENTAL }),
			this.countByDate('pickupDate'),
			this.countByDate('returnDate'),
			this.carModel.countDocuments({
				active: { $ne: false },
				availabilityStatus: AvailabilityStatus.MAINTENANCE,
			}),
			this.reservationModel
				.find()
				.sort({ createdAt: -1 })
				.limit(5)
				.select('bookingReference customerName pickupDate returnDate status createdAt')
				.lean(),
		]);

		return {
			reservations: {
				total: totalReservations,
				pending: pendingReservations,
				confirmed: confirmedReservations,
				activeRentals,
				todayPickups,
				todayReturns,
			},
			maintenance: {
				inProgressCars: maintenanceCars,
			},
			recentReservations,
		};
	}

	private async countByDate(field: 'pickupDate' | 'returnDate') {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

		return this.reservationModel.countDocuments({
			[field]: {
				$gte: start,
				$lt: end,
			},
		});
	}
}
