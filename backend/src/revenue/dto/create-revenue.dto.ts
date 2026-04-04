import { IsNumber, IsDateString, IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRevenueDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty()
  @IsMongoId()
  agencyId: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  carId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRevenueDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  agencyId?: string;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  carId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
