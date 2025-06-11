// server/src/models/wellness.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

export interface IWellnessLog extends Document {
  user: IUser['_id'];
  date: string; // Storing date as YYYY-MM-DD string for easy lookup
  mood?: 'sad' | 'neutral' | 'happy' | 'excited';
  sleepHours?: number;
  waterIntake?: number; // In glasses/units
  activity?: string;
}

const WellnessLogSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: String,
      required: true,
    },
    mood: {
      type: String,
      enum: ['sad', 'neutral', 'happy', 'excited'],
    },
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    waterIntake: {
      type: Number,
      min: 0,
    },
    activity: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// This compound index ensures a user can only have one wellness log per date.
// This is the key to our "log for the day" feature.
WellnessLogSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.model<IWellnessLog>('WellnessLog', WellnessLogSchema);