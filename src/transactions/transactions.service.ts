import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AccountsService } from '../accounts/accounts.service.js';
import {
  Transaction,
  TransactionDocument,
} from './schemas/transaction.schema.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { QueryTransactionDto } from './dto/query-transaction.dto.js';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private accountsService: AccountsService,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionDocument | TransactionDocument[]> {
    await this.accountsService.assertOwnership(dto.accountId, userId);

    if (dto.type === 'transfer') {
      if (!dto.counterpartyAccountId) {
        throw new BadRequestException(
          'counterpartyAccountId is required for transfers',
        );
      }
      if (dto.counterpartyAccountId === dto.accountId) {
        throw new BadRequestException(
          'Transfer source and destination must differ',
        );
      }
      await this.accountsService.assertOwnership(
        dto.counterpartyAccountId,
        userId,
      );

      const transferGroupId = new Types.ObjectId();
      const magnitude = Math.abs(dto.amount);
      const created = await this.transactionModel.insertMany([
        {
          userId,
          accountId: dto.accountId,
          type: 'transfer',
          date: new Date(dto.date),
          amount: -magnitude,
          isSubjectToTaxation: dto.isSubjectToTaxation ?? false,
          transferGroupId,
          note: dto.note,
        },
        {
          userId,
          accountId: dto.counterpartyAccountId,
          type: 'transfer',
          date: new Date(dto.date),
          amount: magnitude,
          isSubjectToTaxation: dto.isSubjectToTaxation ?? false,
          transferGroupId,
          note: dto.note,
        },
      ]);
      return created as unknown as TransactionDocument[];
    }

    return this.transactionModel.create({
      userId,
      accountId: dto.accountId,
      type: dto.type,
      date: new Date(dto.date),
      amount: dto.amount,
      isSubjectToTaxation: dto.isSubjectToTaxation ?? false,
      note: dto.note,
    });
  }

  async findAllByUser(
    userId: string,
    query: QueryTransactionDto = {},
  ): Promise<TransactionDocument[]> {
    const filter: Record<string, unknown> = { userId };
    if (query.accountId) filter.accountId = query.accountId;
    if (query.type) filter.type = query.type;
    if (query.from || query.to) {
      const dateRange: Record<string, Date> = {};
      if (query.from) dateRange.$gte = new Date(query.from);
      if (query.to) dateRange.$lte = new Date(query.to);
      filter.date = dateRange;
    }
    return this.transactionModel.find(filter).sort({ date: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<TransactionDocument> {
    const tx = await this.transactionModel.findOne({ _id: id, userId }).exec();
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }
    return tx;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTransactionDto,
  ): Promise<TransactionDocument> {
    const existing = await this.findOne(id, userId);
    if (existing.transferGroupId) {
      throw new BadRequestException(
        'Transfer transactions cannot be updated; delete and recreate instead',
      );
    }
    if (dto.type === 'transfer') {
      throw new BadRequestException(
        'Cannot convert a transaction into a transfer via update',
      );
    }
    if (dto.accountId) {
      await this.accountsService.assertOwnership(dto.accountId, userId);
    }

    const patch: Partial<Transaction> = {};
    if (dto.accountId) patch.accountId = new Types.ObjectId(dto.accountId);
    if (dto.type) patch.type = dto.type;
    if (dto.date) patch.date = new Date(dto.date);
    if (dto.amount !== undefined) patch.amount = dto.amount;
    if (dto.isSubjectToTaxation !== undefined)
      patch.isSubjectToTaxation = dto.isSubjectToTaxation;
    if (dto.note !== undefined) patch.note = dto.note;

    const updated = await this.transactionModel
      .findOneAndUpdate({ _id: id, userId }, patch, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Transaction not found');
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const tx = await this.findOne(id, userId);
    if (tx.transferGroupId) {
      const result = await this.transactionModel
        .deleteMany({ transferGroupId: tx.transferGroupId, userId })
        .exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException('Transaction not found');
      }
      return;
    }
    const result = await this.transactionModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Transaction not found');
    }
  }

  async sumTaxableIncome(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const [row] = await this.transactionModel
      .aggregate<{ total: number }>([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            isSubjectToTaxation: true,
            type: { $in: ['income', 'interest_income'] },
            date: { $gte: from, $lte: to },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ])
      .exec();
    return row?.total ?? 0;
  }
}
