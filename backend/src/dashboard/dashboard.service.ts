import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../reservations/schemas/reservation.schema';
import { Car, CarDocument } from '../cars/schemas/car.schema';
import { ReservationStatus } from '../common/enums/reservation-status.enum';
import { AvailabilityStatus } from '../common/enums/car.enum';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

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

  async getRevenueAnalytics() {
    const now = new Date();
    const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const last12Weeks = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

    const [monthlyAggregation, weeklyAggregation, totalStats] = await Promise.all([
      // Monthly Revenue
      this.reservationModel.aggregate([
        {
          $match: {
            createdAt: { $gte: last12Months },
            status: { $nin: [ReservationStatus.REJECTED, ReservationStatus.CANCELLED] },
            paymentStatus: 'paid'
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            total: { $sum: '$pricingBreakdown.total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Weekly Revenue
      this.reservationModel.aggregate([
        {
          $match: {
            createdAt: { $gte: last12Weeks },
            status: { $nin: [ReservationStatus.REJECTED, ReservationStatus.CANCELLED] },
            paymentStatus: 'paid'
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              week: { $week: '$createdAt' },
            },
            total: { $sum: '$pricingBreakdown.total' },
          },
        },
        { $sort: { '_id.year': 1, '_id.week': 1 } },
      ]),

      // All-time Stats
      this.reservationModel.aggregate([
        {
          $match: {
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricingBreakdown.total' },
            avgBookingValue: { $avg: '$pricingBreakdown.total' },
            totalBookings: { $sum: 1 }
          }
        }
      ])
    ]);

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    // Process Monthly
    const monthly: Array<{ label: string; amount: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const found = monthlyAggregation.find(a => a._id.month === month && a._id.year === year);
      monthly.push({
        label: `${monthNames[month - 1]} ${year}`,
        amount: found ? found.total : 0,
      });
    }

    // Process Weekly
    const weekly = weeklyAggregation.map(w => ({
      label: `Semaine ${w._id.week}`,
      amount: w.total
    }));

    // Calculate Growth
    const currentMonth = monthlyAggregation.find(a => a._id.month === (now.getMonth() + 1) && a._id.year === now.getFullYear());
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = monthlyAggregation.find(a => a._id.month === (prevMonthDate.getMonth() + 1) && a._id.year === prevMonthDate.getFullYear());
    
    const growth = prevMonth && prevMonth.total > 0 
      ? ((currentMonth?.total || 0) - prevMonth.total) / prevMonth.total * 100 
      : 0;

    return {
      monthly,
      weekly,
      summary: {
        totalRevenue: totalStats[0]?.totalRevenue || 0,
        avgBookingValue: totalStats[0]?.avgBookingValue || 0,
        totalBookings: totalStats[0]?.totalBookings || 0,
        growth: Math.round(growth * 10) / 10
      }
    };
  }
}
