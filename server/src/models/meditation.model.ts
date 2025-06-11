// server/src/models/meditation.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IMeditation extends Document {
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number; // in minutes
  category: 'focus' | 'calm' | 'sleep' | 'anxiety' | 'love' | 'forgiveness';
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  course?: mongoose.Schema.Types.ObjectId; // reference to a course if part of one
  isFeatured: boolean;
  isDownloadable: boolean;
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MeditationSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    audioUrl: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    duration: { type: Number, required: true, min: 1 },
    category: { 
      type: String, 
      required: true, 
      enum: ['focus', 'calm', 'sleep', 'anxiety', 'love', 'forgiveness'] 
    },
    level: { 
      type: String, 
      required: true, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    tags: [{ type: String, trim: true }],
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'MeditationCourse' },
    isFeatured: { type: Boolean, default: false },
    isDownloadable: { type: Boolean, default: true },
    isPremium: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMeditation>('Meditation', MeditationSchema);