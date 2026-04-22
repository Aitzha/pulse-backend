import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ActivityCategory,
  ActivitySubcategory,
} from '../schemas/activity.schema.js';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ActivityCategory)
  category!: ActivityCategory;

  @IsEnum(ActivitySubcategory)
  subcategory!: ActivitySubcategory;

  @IsDateString()
  startTime!: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;
}
