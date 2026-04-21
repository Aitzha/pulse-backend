import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from '../transactions/transactions.module.js';
import { Liability, LiabilitySchema } from './schemas/liability.schema.js';
import { LiabilitiesController } from './liabilities.controller.js';
import { LiabilitiesService } from './liabilities.service.js';

@Module({
  imports: [
    TransactionsModule,
    MongooseModule.forFeature([
      { name: Liability.name, schema: LiabilitySchema },
    ]),
  ],
  controllers: [LiabilitiesController],
  providers: [LiabilitiesService],
})
export class LiabilitiesModule {}
