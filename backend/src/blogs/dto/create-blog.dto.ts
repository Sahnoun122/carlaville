import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  excerpt!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(30)
  content!: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
