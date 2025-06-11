// server/src/models/meditationCourse.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IMeditationCourse extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalSessions: number;
  meditations: mongoose.Schema.Types.ObjectId[]; // references to meditation sessions
  isPremium: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MeditationCourseSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    level: { 
      type: String, 
      required: true, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    totalSessions: { type: Number, required: true, min: 1 },
    meditations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meditation' }],
    isPremium: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMeditationCourse>('MeditationCourse', MeditationCourseSchema);