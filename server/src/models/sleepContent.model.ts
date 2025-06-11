// server/src/models/sleepContent.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ISleepContent extends Document {
  title: string;
  description: string;
  type: 'story' | 'soundscape';
  audioUrl: string;
  imageUrl?: string;
  duration: number; // in minutes
  category: 'sleep' | 'relaxation' | 'wind-down';
  tags: string[];
  isPremium: boolean;
  isDownloadable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SleepContentSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['story', 'soundscape'] 
    },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    duration: { type: Number, required: true, min: 1 },
    category: { 
      type: String, 
      required: true, 
      enum: ['sleep', 'relaxation', 'wind-down'] 
    },
    tags: [{ type: String, trim: true }],
    isPremium: { type: Boolean, default: false },
    isDownloadable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISleepContent>('SleepContent', SleepContentSchema);