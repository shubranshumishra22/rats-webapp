// server/src/models/event.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  title: string;
  eventType: 'birthday' | 'anniversary' | 'holiday' | 'other';
  date: Date;
  recipientName: string;
  recipientRelation: string;
  recipientContact?: {
    email?: string;
    phone?: string;
  };
  socialMediaHandles?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  notes?: string;
  reminderDays: number[]; // Days before the event to send reminders (e.g., [1, 7, 30])
  isRecurring: boolean; // Whether the event repeats annually
  isActive: boolean;
  aiGeneratedMessage?: string;
  aiGeneratedPlan?: string;
  lastMessageSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['birthday', 'anniversary', 'holiday', 'other'],
    },
    date: {
      type: Date,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    recipientRelation: {
      type: String,
      required: true,
      trim: true,
    },
    recipientContact: {
      email: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
    },
    socialMediaHandles: {
      facebook: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
      twitter: {
        type: String,
        trim: true,
      },
      whatsapp: {
        type: String,
        trim: true,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    reminderDays: {
      type: [Number],
      default: [1, 7], // Default to 1 day and 1 week before
    },
    isRecurring: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    aiGeneratedMessage: {
      type: String,
      trim: true,
    },
    aiGeneratedPlan: {
      type: String,
      trim: true,
    },
    lastMessageSent: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index on user and date for efficient querying
EventSchema.index({ user: 1, date: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);