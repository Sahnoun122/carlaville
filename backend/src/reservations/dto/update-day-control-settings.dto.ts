import { IsArray, IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateDayControlSettingsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  minRentalDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  maxRentalDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(730)
  maxAdvanceBookingDays?: number;

  @IsOptional()
  @IsBoolean()
  allowSameDayBooking?: boolean;

  @IsOptional()
  @IsArray()
  blockedWeekdays?: number[];
}
