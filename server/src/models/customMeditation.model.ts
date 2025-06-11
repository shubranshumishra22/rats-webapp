// server/src/models/customMeditation.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

export interface ICustomMeditation extends Document {
  user: IUser['_id'];
  name: string;
  introVoice: 'male' | 'female' | 'none';
  breathworkType: 'box' | '4-7-8' | 'deep' | 'alternate-nostril' | 'none';
  backgroundSound: string; // ID or name of the background sound
  duration: number; // in minutes
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomMeditationSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    introVoice: {
      type: String,
      required: true,
      enum: ['male', 'female', 'none'],
      default: 'female',
    },
    breathworkType: {
      type: String,
      required: true,
      enum: ['box', '4-7-8', 'deep', 'alternate-nostril', 'none'],
      default: 'deep',
    },
    backgroundSound: {
      type: String,
      required: true,
      default: 'rain',
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICustomMeditation>('CustomMeditation', CustomMeditationSchema);