import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LiabilityDocument = HydratedDocument<Liability>;

export const LIABILITY_TYPES = ['loan', 'tax', 'social'] as const;
export type LiabilityType = (typeof LIABILITY_TYPES)[number];

export const TAX_KINDS = ['yearly', 'semiannual_h1', 'semiannual_h2'] as const;
export type TaxKind = (typeof TAX_KINDS)[number];

@Schema({ timestamps: true })
export class Liability {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: LIABILITY_TYPES, index: true })
  type!: LiabilityType;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  currency!: string;

  // Loan
  @Prop()
  totalAmount?: number;

  @Prop()
  durationMonths?: number;

  @Prop()
  remainingMonths?: number;

  @Prop()
  monthlyPayment?: number;

  // Tax
  @Prop({ enum: TAX_KINDS })
  taxKind?: TaxKind;

  @Prop()
  rate?: number;

  @Prop()
  periodStart?: Date;

  @Prop()
  periodEnd?: Date;

  @Prop()
  nextPaymentDate?: Date;

  // Social
  @Prop()
  amount?: number;

  @Prop()
  dueDayOfMonth?: number;

  @Prop()
  lastPaidMonth?: string;
}

export const LiabilitySchema = SchemaFactory.createForClass(Liability);
