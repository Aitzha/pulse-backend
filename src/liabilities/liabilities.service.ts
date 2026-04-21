import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TransactionsService } from '../transactions/transactions.service.js';
import { Liability, LiabilityDocument } from './schemas/liability.schema.js';
import { CreateLiabilityDto } from './dto/create-liability.dto.js';
import { UpdateLiabilityDto } from './dto/update-liability.dto.js';
import {
  computeNextSocialDueDate,
  computeTaxWindow,
} from './utils/tax-dates.js';

type LiabilityLean = Liability & { _id: unknown };
type LiabilityWithComputed = LiabilityLean & { calculatedAmount?: number };

@Injectable()
export class LiabilitiesService {
  constructor(
    @InjectModel(Liability.name)
    private liabilityModel: Model<LiabilityDocument>,
    private transactionsService: TransactionsService,
  ) {}

  async create(
    userId: string,
    dto: CreateLiabilityDto,
  ): Promise<LiabilityDocument> {
    const payload = this.buildPayload(dto);
    return this.liabilityModel.create({ ...payload, userId });
  }

  async findAllByUser(userId: string): Promise<LiabilityWithComputed[]> {
    const liabilities = (await this.liabilityModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as LiabilityLean[];

    return Promise.all(liabilities.map((l) => this.enrich(userId, l)));
  }

  async findOne(id: string, userId: string): Promise<LiabilityWithComputed> {
    const liability = (await this.liabilityModel
      .findOne({ _id: id, userId })
      .lean()
      .exec()) as unknown as LiabilityLean | null;
    if (!liability) {
      throw new NotFoundException('Liability not found');
    }
    return this.enrich(userId, liability);
  }

  private async enrich(
    userId: string,
    l: LiabilityLean,
  ): Promise<LiabilityWithComputed> {
    if (l.type === 'tax' && l.periodStart && l.periodEnd && l.rate != null) {
      const taxable = await this.transactionsService.sumTaxableIncome(
        userId,
        l.periodStart,
        l.periodEnd,
      );
      return { ...l, calculatedAmount: taxable * l.rate };
    }
    return l;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateLiabilityDto,
  ): Promise<LiabilityDocument> {
    if (dto.type) {
      throw new BadRequestException('Changing liability type is not allowed');
    }
    const existing = await this.liabilityModel
      .findOne({ _id: id, userId })
      .exec();
    if (!existing) {
      throw new NotFoundException('Liability not found');
    }

    const patch = this.buildUpdatePayload(existing.type, dto);
    const updated = await this.liabilityModel
      .findOneAndUpdate({ _id: id, userId }, patch, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Liability not found');
    }
    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.liabilityModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Liability not found');
    }
  }

  private buildPayload(dto: CreateLiabilityDto): Partial<Liability> {
    const base: Partial<Liability> = {
      type: dto.type,
      name: dto.name,
      currency: dto.currency,
    };

    if (dto.type === 'loan') {
      const totalAmount = dto.totalAmount!;
      const durationMonths = dto.durationMonths!;
      return {
        ...base,
        totalAmount,
        durationMonths,
        remainingMonths: dto.remainingMonths ?? durationMonths,
        monthlyPayment: totalAmount / durationMonths,
      };
    }

    if (dto.type === 'tax') {
      const window = computeTaxWindow(dto.taxKind!, new Date());
      return {
        ...base,
        taxKind: dto.taxKind,
        rate: dto.rate,
        periodStart: window.periodStart,
        periodEnd: window.periodEnd,
        nextPaymentDate: window.nextPaymentDate,
      };
    }

    // social
    const dueDayOfMonth = dto.dueDayOfMonth ?? 25;
    return {
      ...base,
      amount: dto.amount,
      dueDayOfMonth,
      lastPaidMonth: dto.lastPaidMonth,
      nextPaymentDate: computeNextSocialDueDate(
        dueDayOfMonth,
        dto.lastPaidMonth,
        new Date(),
      ),
    };
  }

  private buildUpdatePayload(
    type: Liability['type'],
    dto: UpdateLiabilityDto,
  ): Partial<Liability> {
    const patch: Partial<Liability> = {};
    if (dto.name !== undefined) patch.name = dto.name;
    if (dto.currency !== undefined) patch.currency = dto.currency;

    if (type === 'loan') {
      if (dto.totalAmount !== undefined) patch.totalAmount = dto.totalAmount;
      if (dto.durationMonths !== undefined)
        patch.durationMonths = dto.durationMonths;
      if (dto.remainingMonths !== undefined)
        patch.remainingMonths = dto.remainingMonths;
      const totalAmount = dto.totalAmount;
      const durationMonths = dto.durationMonths;
      if (totalAmount !== undefined && durationMonths !== undefined) {
        patch.monthlyPayment = totalAmount / durationMonths;
      }
    } else if (type === 'tax') {
      if (dto.rate !== undefined) patch.rate = dto.rate;
      if (dto.taxKind !== undefined) {
        const window = computeTaxWindow(dto.taxKind, new Date());
        patch.taxKind = dto.taxKind;
        patch.periodStart = window.periodStart;
        patch.periodEnd = window.periodEnd;
        patch.nextPaymentDate = window.nextPaymentDate;
      }
    } else if (type === 'social') {
      if (dto.amount !== undefined) patch.amount = dto.amount;
      if (dto.dueDayOfMonth !== undefined)
        patch.dueDayOfMonth = dto.dueDayOfMonth;
      if (dto.lastPaidMonth !== undefined)
        patch.lastPaidMonth = dto.lastPaidMonth;
      if (dto.dueDayOfMonth !== undefined || dto.lastPaidMonth !== undefined) {
        patch.nextPaymentDate = computeNextSocialDueDate(
          dto.dueDayOfMonth ?? 25,
          dto.lastPaidMonth,
          new Date(),
        );
      }
    }

    return patch;
  }
}
