import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FinanceDocument = HydratedDocument<Finance>;

@Schema({ timestamps: true })
export class Finance {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;
}

export const FinanceSchema = SchemaFactory.createForClass(Finance);
