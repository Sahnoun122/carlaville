import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PricingConfig,
  PricingConfigDocument,
} from './schemas/pricing-config.schema';
import { CreatePricingConfigDto } from './dto/create-pricing-config.dto';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectModel(PricingConfig.name)
    private pricingConfigModel: Model<PricingConfigDocument>,
  ) {}

  // PricingConfig CRUD
  async createConfig(
    createDto: CreatePricingConfigDto,
  ): Promise<PricingConfig> {
    const createdConfig = new this.pricingConfigModel(createDto);
    return createdConfig.save();
  }

  async findAllConfigs(): Promise<PricingConfig[]> {
    return this.pricingConfigModel.find().exec();
  }

  async findConfigById(id: string): Promise<PricingConfig> {
    const config = await this.pricingConfigModel.findById(id).exec();
    if (!config) {
      throw new NotFoundException(`Pricing config with id ${id} not found`);
    }
    return config;
  }

  async updateConfig(
    id: string,
    updateDto: UpdatePricingConfigDto,
  ): Promise<PricingConfig> {
    const updatedConfig = await this.pricingConfigModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updatedConfig) {
      throw new NotFoundException(`Pricing config with id ${id} not found`);
    }
    return updatedConfig;
  }

  async getActiveConfig(): Promise<PricingConfig> {
    const config = await this.pricingConfigModel
      .findOne({ active: true })
      .exec();
    if (!config) {
      throw new NotFoundException('No active pricing configuration found.');
    }
    return config;
  }

  // Pricing Calculation Logic
  async calculatePrice(dto: CalculatePriceDto) {
    const config = await this.getActiveConfig();

    const rentalDays = this.calculateRentalDays(dto.pickupDate, dto.returnDate);
    const baseAmount = this.calculateBaseAmount(rentalDays, dto.dailyPrice);
    const extrasTotal = this.calculateExtras(rentalDays, dto, config);
    const insuranceFee = this.calculateInsurance(config);
    const subTotal = baseAmount + extrasTotal + insuranceFee + dto.deliveryFee;
    const commissionAmount = this.calculateCommission(subTotal, config);
    const taxAmount = this.calculateTax(subTotal, config);
    const totalAmount = subTotal + taxAmount;

    return {
      rentalDays,
      dailyRate: dto.dailyPrice,
      baseAmount,
      deliveryFee: dto.deliveryFee,
      insuranceFee,
      extrasTotal,
      commissionAmount,
      taxAmount,
      totalAmount,
      depositAmount: 0, // This can be a fixed value or from car settings
    };
  }

  calculateRentalDays(pickupDate: string, returnDate: string): number {
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  }

  calculateBaseAmount(rentalDays: number, dailyPrice: number): number {
    return rentalDays * dailyPrice;
  }

  calculateExtras(
    rentalDays: number,
    dto: CalculatePriceDto,
    config: PricingConfig,
  ): number {
    let extras = 0;
    if (dto.gps) {
      extras += rentalDays * config.gpsDailyFee;
    }
    if (dto.childSeat) {
      extras += rentalDays * config.childSeatDailyFee;
    }
    if (dto.additionalDriver) {
      extras += config.additionalDriverFlatFee;
    }
    return extras;
  }

  calculateInsurance(config: PricingConfig): number {
    return config.insuranceFlatFee;
  }

  calculateCommission(subTotal: number, config: PricingConfig): number {
    return (subTotal * config.platformCommissionPercent) / 100;
  }

  calculateTax(subTotal: number, config: PricingConfig): number {
    return (subTotal * config.taxPercent) / 100;
  }
}
