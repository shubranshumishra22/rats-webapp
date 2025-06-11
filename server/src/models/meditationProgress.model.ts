// server/src/models/meditationProgress.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

export interface IMeditationProgress extends Document {
  user: IUser['_id'];
  meditation: mongoose.Schema.Types.ObjectId; // Can be meditation or sleep content
  contentType: 'meditation' | 'sleep';
  completedAt: Date;
  duration: number; // actual time spent in minutes
  mood: 'stressed' | 'anxious' | 'neutral' | 'calm' | 'happy';
  moodAfter?: 'stressed' | 'anxious' | 'neutral' | 'calm' | 'happy';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeditationProgressSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    meditation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType'
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Meditation', 'SleepContent']
    },
    completedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    mood: {
      type: String,
      required: true,
      enum: ['stressed', 'anxious', 'neutral', 'calm', 'happy'],
    },
    moodAfter: {
      type: String,
      enum: ['stressed', 'anxious', 'neutral', 'calm', 'happy'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMeditationProgress>('MeditationProgress', MeditationProgressSchema);