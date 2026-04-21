import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

export const TRANSACTION_TYPES = [
  'expense',
  'income',
  'transfer',
  'interest_income',
  'adjustment',
  'market_reevaluation',
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  })
  accountId!: Types.ObjectId;

  @Prop({ required: true, enum: TRANSACTION_TYPES })
  type!: TransactionType;

  @Prop({ required: true, index: true })
  date!: Date;

  @Prop({ required: true })
  amount!: number;

  @Prop({ default: false })
  isSubjectToTaxation!: boolean;

  @Prop({ type: Types.ObjectId, index: true })
  transferGroupId?: Types.ObjectId;

  @Prop()
  note?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
