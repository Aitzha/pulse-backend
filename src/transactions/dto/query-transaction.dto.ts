import { IsDateString, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { TRANSACTION_TYPES } from '../schemas/transaction.schema.js';
import type { TransactionType } from '../schemas/transaction.schema.js';

export class QueryTransactionDto {
  @IsOptional()
  @IsMongoId()
  accountId?: string;

  @IsOptional()
  @IsEnum(TRANSACTION_TYPES)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
