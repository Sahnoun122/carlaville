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
			revenueAggregation,
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
			this.reservationModel.aggregate([
				{
					$match: {
						createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) },
						status: { $ne: ReservationStatus.REJECTED },
					},
				},
				{
					$group: {
						_id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
						totalRevenue: { $sum: '$pricingBreakdown.total' },
					},
				},
			]),
		]);

		const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
		const revenue: Array<{ label: string; amount: number }> = [];
		for (let i = 5; i >= 0; i--) {
			const d = new Date();
			d.setMonth(d.getMonth() - i);
			const year = d.getFullYear();
			const month = d.getMonth() + 1;
			const found = revenueAggregation.find((item) => item._id.year === year && item._id.month === month);
			revenue.push({
				label: monthNames[month - 1],
				amount: found ? found.totalRevenue || 0 : 0,
			});
		}

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
			revenue,
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
