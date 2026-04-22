import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum ActivityCategory {
  WorkStudy = 'Work/Study',
  Routine = 'Routine',
  Unplanned = 'Unplanned',
  Health = 'Health',
}

export enum ActivitySubcategory {
  Programming = 'Programming',
  Drawing = 'Drawing',
  LearningGerman = 'Learning German',
  MorningRoutine = 'Morning Routine',
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  NightRoutine = 'Night Routine',
  WashUp = 'Wash up',
  TeaBreak = 'Tea Break',
  SelfCare = 'Self Care',
  Other = 'Other',
  Social = 'Social',
  Gym = 'Gym',
  Sleep = 'Sleep',
  Nap = 'Nap',
}

export const ACTIVITY_SUBCATEGORIES: Record<
  ActivityCategory,
  ActivitySubcategory[]
> = {
  [ActivityCategory.WorkStudy]: [
    ActivitySubcategory.Programming,
    ActivitySubcategory.Drawing,
    ActivitySubcategory.LearningGerman,
  ],
  [ActivityCategory.Routine]: [
    ActivitySubcategory.MorningRoutine,
    ActivitySubcategory.Breakfast,
    ActivitySubcategory.Lunch,
    ActivitySubcategory.Dinner,
    ActivitySubcategory.NightRoutine,
    ActivitySubcategory.WashUp,
    ActivitySubcategory.TeaBreak,
  ],
  [ActivityCategory.Unplanned]: [
    ActivitySubcategory.SelfCare,
    ActivitySubcategory.Other,
  ],
  [ActivityCategory.Health]: [
    ActivitySubcategory.Social,
    ActivitySubcategory.Gym,
    ActivitySubcategory.Sleep,
    ActivitySubcategory.Nap,
  ],
};

export type ActivityDocument = HydratedDocument<Activity>;

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description!: string;

  @Prop({ required: true, enum: ActivityCategory })
  category!: ActivityCategory;

  @Prop({ required: true, enum: ActivitySubcategory })
  subcategory!: ActivitySubcategory;

  @Prop({ required: true })
  startTime!: Date;

  @Prop()
  endTime!: Date;

  @Prop({ min: 0 })
  durationMinutes!: number;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
