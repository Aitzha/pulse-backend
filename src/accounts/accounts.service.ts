import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Transaction,
  TransactionDocument,
} from '../transactions/schemas/transaction.schema.js';
import { Account, AccountDocument } from './schemas/account.schema.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateAccountDto,
  ): Promise<AccountDocument> {
    return this.accountModel.create({ ...dto, userId });
  }

  async findAllByUser(userId: string): Promise<AccountDocument[]> {
    return this.accountModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<AccountDocument> {
    const account = await this.accountModel.findOne({ _id: id, userId }).exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async assertOwnership(id: string, userId: string): Promise<void> {
    const exists = await this.accountModel.exists({ _id: id, userId }).exec();
    if (!exists) {
      throw new NotFoundException('Account not found');
    }
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateAccountDto,
  ): Promise<AccountDocument> {
    const account = await this.accountModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .exec();
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  async remove(id: string, userId: string): Promise<void> {
    const hasTransactions = await this.transactionModel
      .exists({ accountId: id, userId })
      .exec();
    if (hasTransactions) {
      throw new ConflictException(
        'Account cannot be deleted while it has transactions',
      );
    }
    const result = await this.accountModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Account not found');
    }
  }
}
