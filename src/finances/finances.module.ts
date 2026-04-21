import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Finance, FinanceSchema } from './schemas/finance.schema.js';
import { FinancesController } from './finances.controller.js';
import { FinancesService } from './finances.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Finance.name, schema: FinanceSchema }]),
  ],
  controllers: [FinancesController],
  providers: [FinancesService],
})
export class FinancesModule {}
