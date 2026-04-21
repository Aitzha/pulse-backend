import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { LIABILITY_TYPES, TAX_KINDS } from '../schemas/liability.schema.js';
import type { LiabilityType, TaxKind } from '../schemas/liability.schema.js';

export class CreateLiabilityDto {
  @IsEnum(LIABILITY_TYPES)
  type!: LiabilityType;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  // Loan
  @ValidateIf((o: CreateLiabilityDto) => o.type === 'loan')
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ValidateIf((o: CreateLiabilityDto) => o.type === 'loan')
  @IsInt()
  @Min(1)
  durationMonths?: number;

  @ValidateIf((o: CreateLiabilityDto) => o.type === 'loan')
  @IsOptional()
  @IsInt()
  @Min(0)
  remainingMonths?: number;

  // Tax
  @ValidateIf((o: CreateLiabilityDto) => o.type === 'tax')
  @IsEnum(TAX_KINDS)
  taxKind?: TaxKind;

  @ValidateIf((o: CreateLiabilityDto) => o.type === 'tax')
  @IsNumber()
  @Min(0)
  @Max(1)
  rate?: number;

  // Social
  @ValidateIf((o: CreateLiabilityDto) => o.type === 'social')
  @IsNumber()
  @Min(0)
  amount?: number;

  @ValidateIf((o: CreateLiabilityDto) => o.type === 'social')
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  dueDayOfMonth?: number;

  @ValidateIf((o: CreateLiabilityDto) => o.type === 'social')
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'lastPaidMonth must be YYYY-MM' })
  lastPaidMonth?: string;
}
