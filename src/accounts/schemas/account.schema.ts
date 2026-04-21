import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

@Schema({ timestamps: true })
export class Account {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  provider!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  initialBalance!: number;

  @Prop({ required: true })
  currency!: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
