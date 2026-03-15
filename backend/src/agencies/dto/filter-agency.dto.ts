import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AgencyStatus } from '../../common/enums/agency-status.enum';

export class FilterAgencyDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(AgencyStatus)
  status?: AgencyStatus;

  @IsOptional()
  @IsString()
  active?: string;
}
