import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class FilterBlogDto {
  @IsOptional()
  @IsBooleanString()
  published?: string;

  @IsOptional()
  @IsString()
  q?: string;
}
