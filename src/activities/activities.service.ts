import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { QueryActivityDto } from './dto/query-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(
    userId: string,
    dto: CreateActivityDto,
  ): Promise<ActivityDocument> {
    const activity = new this.activityModel({ ...dto, userId });
    if (activity.endTime) {
      activity.durationMinutes = this.calculateDurationMinutes(
        activity.startTime,
        activity.endTime,
      );
    }
    return activity.save();
  }

  private calculateDurationMinutes(startTime: Date, endTime: Date): number {
    return Math.max(
      0,
      Math.round((endTime.getTime() - startTime.getTime()) / 60000),
    );
  }

  async findAllByUser(
    userId: string,
    query: QueryActivityDto = {},
  ): Promise<ActivityDocument[]> {
    const filter: Record<string, unknown> = { userId };
    if (query.from || query.to) {
      const range: Record<string, Date> = {};
      if (query.from) range.$gte = new Date(query.from);
      if (query.to) range.$lte = new Date(query.to);
      filter.startTime = range;
    }
    return this.activityModel.find(filter).sort({ startTime: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<ActivityDocument> {
    const activity = await this.activityModel
      .findOne({ _id: id, userId })
      .exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateActivityDto,
  ): Promise<ActivityDocument> {
    const activity = await this.activityModel
      .findOne({ _id: id, userId })
      .exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    Object.assign(activity, dto);
    if (activity.endTime) {
      activity.durationMinutes = this.calculateDurationMinutes(
        new Date(activity.startTime),
        new Date(activity.endTime),
      );
    }
    return activity.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.activityModel
      .deleteOne({ _id: id, userId })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Activity not found');
    }
  }
}
