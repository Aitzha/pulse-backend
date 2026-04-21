import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { TRANSACTION_TYPES } from '../schemas/transaction.schema.js';
import type { TransactionType } from '../schemas/transaction.schema.js';

export class CreateTransactionDto {
  @IsMongoId()
  accountId!: string;

  @IsEnum(TRANSACTION_TYPES)
  type!: TransactionType;

  @IsDateString()
  date!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsBoolean()
  isSubjectToTaxation?: boolean;

  @ValidateIf((o: CreateTransactionDto) => o.type === 'transfer')
  @IsMongoId()
  counterpartyAccountId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
