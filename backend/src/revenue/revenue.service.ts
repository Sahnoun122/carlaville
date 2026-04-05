import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Schema as MongooseSchema, Types } from 'mongoose';
import { Revenue, RevenueDocument } from './schemas/revenue.schema';
import { CreateRevenueDto, UpdateRevenueDto } from './dto/create-revenue.dto';
import { ReservationDocument } from '../reservations/schemas/reservation.schema';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import { Agency, AgencyDocument } from '../agencies/schemas/agency.schema';

@Injectable()
export class RevenueService {
  constructor(
    @InjectModel(Revenue.name)
    private readonly revenueModel: Model<RevenueDocument>,
    @InjectModel(Agency.name)
    private readonly agencyModel: Model<AgencyDocument>,
  ) {}

  async create(createRevenueDto: CreateRevenueDto): Promise<RevenueDocument> {
    const { date, ...data } = createRevenueDto;
    
    // Calculate net and commission based on agency
    const agency = await this.agencyModel.findById(data.agencyId);
    const commissionRate = (agency?.commissionRate || 15) / 100;
    const commissionAmount = data.amount * commissionRate;
    const netAmount = data.amount - commissionAmount;

    const createdRevenue = new this.revenueModel({
      ...data,
      recognizedDate: date ? new Date(date) : new Date(),
      commissionAmount,
      netAmount,
      source: 'MANUAL',
      // Manual entries need total same as base for now
      baseAmount: data.amount,
      bookingReference: `MANUAL-${Date.now()}`,
      reservationId: new Types.ObjectId(), // Placeholder for manual entries
    });
    return createdRevenue.save();
  }

  async findAll(query: any = {}): Promise<RevenueDocument[]> {
    return this.revenueModel
      .find(query)
      .sort({ date: -1 })
      .populate('agencyId', 'name city')
      .populate('carId', 'brand model year')
      .exec();
  }

  async findOne(id: string): Promise<RevenueDocument> {
    const revenue = await this.revenueModel
      .findById(id)
      .populate('agencyId', 'name city')
      .populate('carId', 'brand model year')
      .exec();
    if (!revenue) {
      throw new NotFoundException(`Revenue with ID ${id} not found`);
    }
    return revenue;
  }

  async update(id: string, updateRevenueDto: UpdateRevenueDto): Promise<RevenueDocument> {
    const existingRevenue = await this.revenueModel
      .findByIdAndUpdate(id, updateRevenueDto, { new: true })
      .exec();
    if (!existingRevenue) {
      throw new NotFoundException(`Revenue with ID ${id} not found`);
    }
    return existingRevenue;
  }

  async remove(id: string): Promise<void> {
    const result = await this.revenueModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Revenue with ID ${id} not found`);
    }
  }

  async getSummary(agencyId?: string, carId?: string): Promise<{ total: number }> {
    const filter: any = {};
    if (agencyId) {
      filter.agencyId = { $in: [agencyId, new Types.ObjectId(agencyId)] };
    }
    if (carId) {
      filter.carId = { $in: [carId, new Types.ObjectId(carId)] };
    }

    const result = await this.revenueModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return { total: result[0]?.total || 0 };
  }

  async recognizeFromReservation(reservation: ReservationDocument): Promise<RevenueDocument> {
    const pricing = reservation.pricingBreakdown || {};
    
    // Check if already recognized to avoid duplicates
    const existing = await this.revenueModel.findOne({ reservationId: reservation._id as any } as any).exec();
    if (existing) {
       return existing;
    }

    const amount = pricing.total || pricing.totalAmount || pricing.estimatedTotal || 0;
    const baseAmount = pricing.basePrice || pricing.baseAmount || 0;
    const extrasTotal = pricing.extrasPrice || pricing.extrasTotal || 0;
    const insuranceFee = pricing.insuranceFee || 0;
    const deliveryFee = pricing.deliveryFee || 0;
    const taxAmount = pricing.taxAmount || 0;
    
    
    // Logic for commission
    let commissionRate = 0.15; 
    if (reservation.agencyId) {
       const agency = await this.agencyModel.findById(reservation.agencyId).exec();
       if (agency && agency.commissionRate !== undefined) {
         commissionRate = agency.commissionRate / 100;
       }
    }

    const commissionAmount = amount * commissionRate;
    const netAmount = amount - commissionAmount;

    const entry = new this.revenueModel({
      reservationId: reservation._id,
      bookingReference: reservation.bookingReference,
      agencyId: reservation.agencyId,
      carId: reservation.carId,
      amount,
      baseAmount,
      extrasTotal,
      insuranceFee,
      deliveryFee,
      taxAmount,
      commissionAmount,
      netAmount,
      recognizedDate: new Date(),
      paidAt: reservation.paidAt || new Date(),
      paymentMethod: reservation.paymentMethod,
      paymentStatus: reservation.paymentStatus || PaymentStatus.PAID_ON_DELIVERY,
      source: 'AUTO',
    });

    return entry.save();
  }

  async getRankings(): Promise<{ topCars: any[], topAgencies: any[] }> {
    const topCars = await this.revenueModel.aggregate([
      { $match: { carId: { $ne: null } } },
      { 
        $group: { 
          _id: '$carId', 
          totalRevenue: { $sum: '$amount' },
          netRevenue: { $sum: '$netAmount' },
          commissions: { $sum: '$commissionAmount' }
        } 
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'cars',
          localField: '_id',
          foreignField: '_id',
          as: 'car',
        },
      },
      { $unwind: '$car' },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          netRevenue: 1,
          commissions: 1,
          name: { $concat: ['$car.brand', ' ', '$car.model'] },
          registrationNumber: '$car.registrationNumber',
        },
      },
    ]);

    const topAgencies = await this.revenueModel.aggregate([
      { $match: { agencyId: { $ne: null } } },
      { 
        $group: { 
          _id: '$agencyId', 
          totalRevenue: { $sum: '$amount' },
          netRevenue: { $sum: '$netAmount' },
          commissions: { $sum: '$commissionAmount' }
        } 
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'agencies',
          localField: '_id',
          foreignField: '_id',
          as: 'agency',
        },
      },
      { $unwind: '$agency' },
      {
        $project: {
          _id: 1,
          totalRevenue: 1,
          netRevenue: 1,
          commissions: 1,
          name: '$agency.name',
          city: '$agency.city',
        },
      },
    ]);

    return { topCars, topAgencies };
  }

  async getTimeframeAnalytics(agencyId?: string): Promise<any> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - todayStart.getDay());
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const matchAndSum = async (startDate: Date, endDate?: Date) => {
      const match: any = {};
      
      if (agencyId && agencyId !== 'all') {
        match.agencyId = { $in: [agencyId, new Types.ObjectId(agencyId)] };
      }

      const dateQuery: any = { $gte: startDate };
      if (endDate) {
        dateQuery.$lt = endDate;
      }
      match.recognizedDate = dateQuery;

      const result = await this.revenueModel.aggregate([
        { $match: match },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' }, 
            net: { $sum: '$netAmount' },
            count: { $sum: 1 } 
          } 
        }
      ]);
      
      return result[0] || { total: 0, net: 0, count: 0 };
    };

    const [today, yesterday, week, month, year] = await Promise.all([
      matchAndSum(todayStart),
      matchAndSum(yesterdayStart, todayStart),
      matchAndSum(weekStart),
      matchAndSum(monthStart),
      matchAndSum(yearStart)
    ]);

    return {
      today,
      yesterday,
      thisWeek: week,
      thisMonth: month,
      thisYear: year
    };
  }

  async getTurnoverBreakdown(agencyId?: string): Promise<any[]> {
    const match: any = { agencyId: { $ne: null } };
    if (agencyId) {
      match.agencyId = { $in: [agencyId, new Types.ObjectId(agencyId)] };
    }

    return this.revenueModel.aggregate([
      // Only keep records attached to an agency
      { $match: match },
      
      // First, group by Agency AND Car to get the total revenue per Car within each Agency
      {
        $group: {
          _id: { agencyId: '$agencyId', carId: '$carId' },
          carRevenue: { $sum: '$amount' },
          carNet: { $sum: '$netAmount' },
          carCommission: { $sum: '$commissionAmount' }
        },
      },
      
      // Then, group by Agency to gather all its cars and calculate the Agency's total revenue
      {
        $group: {
          _id: '$_id.agencyId',
          totalAgencyRevenue: { $sum: '$carRevenue' },
          totalAgencyNet: { $sum: '$carNet' },
          totalAgencyCommission: { $sum: '$carCommission' },
          carsCount: { $sum: 1 },
          cars: {
            $push: {
              carId: '$_id.carId',
              totalRevenue: '$carRevenue',
              totalNet: '$carNet',
              totalCommission: '$carCommission'
            },
          },
        },
      },
      
      // Sort agencies by total revenue descending (Top Agencies first)
      { $sort: { totalAgencyRevenue: -1 } },
      
      // Lookup Agency details
      {
        $lookup: {
          from: 'agencies',
          localField: '_id',
          foreignField: '_id',
          as: 'agencyDetails',
        },
      },
      { $unwind: '$agencyDetails' },
      
      // Unwind cars array to lookup their details, preserving agencies with no cars (or unassigned car revenue)
      { $unwind: { path: '$cars', preserveNullAndEmptyArrays: true } },
      
      // Lookup Car details
      {
        $lookup: {
          from: 'cars',
          localField: 'cars.carId',
          foreignField: '_id',
          as: 'carDetails',
        },
      },
      // Since some revenues might not be assigned to a specific car (carId = null), we use preserveNullAndEmptyArrays
      { $unwind: { path: '$carDetails', preserveNullAndEmptyArrays: true } },
      
      // Re-group to format the cars array beautifully
      {
        $group: {
          _id: '$_id',
          agencyName: { $first: '$agencyDetails.name' },
          agencyCity: { $first: '$agencyDetails.city' },
          totalAgencyRevenue: { $first: '$totalAgencyRevenue' },
          totalAgencyNet: { $first: '$totalAgencyNet' },
          totalAgencyCommission: { $first: '$totalAgencyCommission' },
          vehicles: {
            $push: {
              $cond: [
                { $ne: ['$cars.carId', null] },
                {
                  carId: '$cars.carId',
                  revenue: '$cars.totalRevenue',
                  revenueNet: '$cars.totalNet',
                  brand: '$carDetails.brand',
                  model: '$carDetails.model',
                  registrationNumber: '$carDetails.registrationNumber',
                },
                null
              ]
            }
          }
        }
      },
      
      // Clean up the vehicles array (remove nulls resulting from unassigned car revenues)
      {
        $project: {
          _id: 1,
          agencyName: 1,
          agencyCity: 1,
          totalAgencyRevenue: 1,
          vehicles: {
            $filter: {
              input: '$vehicles',
              as: 'vehicle',
              cond: { $ne: ['$$vehicle', null] }
            }
          }
        }
      },
      
      // Final projection to sort the vehicles array by revenue descending within each agency
      {
        $project: {
          _id: 1,
          agencyName: 1,
          agencyCity: 1,
          totalAgencyRevenue: 1,
          totalAgencyNet: 1,
          totalAgencyCommission: 1,
          vehicles: {
            $sortArray: { input: '$vehicles', sortBy: { revenue: -1 } }
          }
        }
      }
    ]);
  }
}

