import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Finance, FinanceDocument } from './schemas/finance.schema.js';
import { CreateFinanceDto } from './dto/create-finance.dto.js';
import { UpdateFinanceDto } from './dto/update-finance.dto.js';

@Injectable()
export class FinancesService {
  constructor(
    @InjectModel(Finance.name) private financeModel: Model<FinanceDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateFinanceDto,
  ): Promise<FinanceDocument> {
    return this.financeModel.create({ ...dto, userId });
  }

  async findAllByUser(userId: string): Promise<FinanceDocument[]> {
    return this.financeModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<FinanceDocument> {
    const finance = await this.financeModel.findOne({ _id: id, userId }).exec();
    if (!finance) {
      throw new NotFoundException('Transaction not found');
    }
    return finance;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateFinanceDto,
  ): Promise<FinanceDocument> {
    const finance = await this.financeModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .exec();
    if (!finance) {
      throw new NotFoundException('Transaction not found');
    }
    return finance;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.financeModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Transaction not found');
    }
  }
}
