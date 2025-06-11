// server/src/models/post.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './user.model';

export interface IPost extends Document {
  author: IUser['_id'];
  content: string;
  type: 'general' | 'event';
  likes: IUser['_id'][];
  comments: {
    user: IUser['_id'];
    text: string;
    createdAt: Date;
  }[];
  
  // Field to link a shared post back to the original
  sharedFrom?: mongoose.Schema.Types.ObjectId;

  // Optional fields for events
  eventDate?: Date;
  location?: string;
  imageUrl?: string;
  linkUrl?: string;
}

const PostSchema: Schema = new Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true, trim: true },
    type: { type: String, enum: ['general', 'event'], required: true, default: 'general' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
    
    // Schema definition for the sharedFrom field
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },

    eventDate: { type: Date },
    location: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    linkUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPost>('Post', PostSchema);
