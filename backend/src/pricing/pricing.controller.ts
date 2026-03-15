import {
  Controller,
  UseGuards,
  Post,
  Body,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { PricingService } from './pricing.service';
import { CreatePricingConfigDto } from './dto/create-pricing-config.dto';
import { UpdatePricingConfigDto } from './dto/update-pricing-config.dto';
import { CalculatePriceDto } from './dto/calculate-price.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // Public or reservation-manager accessible route
  @UseGuards(JwtAuthGuard)
  @Post('calculate')
  calculatePrice(@Body() calculatePriceDto: CalculatePriceDto) {
    return this.pricingService.calculatePrice(calculatePriceDto);
  }

  // Admin routes for pricing config
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('config')
  createConfig(@Body() createDto: CreatePricingConfigDto) {
    return this.pricingService.createConfig(createDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('config')
  findAllConfigs() {
    return this.pricingService.findAllConfigs();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('config/active')
  getActiveConfig() {
    return this.pricingService.getActiveConfig();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('config/:id')
  findConfigById(@Param('id') id: string) {
    return this.pricingService.findConfigById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('config/:id')
  updateConfig(
    @Param('id') id: string,
    @Body() updateDto: UpdatePricingConfigDto,
  ) {
    return this.pricingService.updateConfig(id, updateDto);
  }
}
