import { IsDateString, IsOptional } from 'class-validator';

export class QueryActivityDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
