import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';

@Injectable()
export class ActivitiesService {
  constructor(@InjectModel(Activity.name) private activityModel: Model<ActivityDocument>) {}

  async create(userId: string, dto: CreateActivityDto): Promise<ActivityDocument> {
    return this.activityModel.create({ ...dto, userId });
  }

  async findAllByUser(userId: string): Promise<ActivityDocument[]> {
    return this.activityModel.find({ userId }).sort({ startTime: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<ActivityDocument> {
    const activity = await this.activityModel.findOne({ _id: id, userId }).exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  async update(id: string, userId: string, dto: UpdateActivityDto): Promise<ActivityDocument> {
    const activity = await this.activityModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.activityModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Activity not found');
    }
  }
}
