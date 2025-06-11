// server/src/models/user.model.ts

import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  username: string;
  password?: string;
  dailyCalorieGoal?: number;
  streak?: number;
  lastStreakUpdate?: Date;
  
  // Profile fields
  profilePictureUrl?: string;
  bio?: string;
  location?: string;
  
  // Social media links (public handles)
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  };
  
  // Social media authentication (OAuth tokens)
  socialMediaAuth?: {
    instagram?: {
      userId: string;
      accessToken: string;
      tokenExpiry: Date;
    };
    facebook?: {
      userId: string;
      accessToken: string;
      tokenExpiry: Date;
    };
    twitter?: {
      userId: string;
      accessToken: string;
      accessSecret: string;
      tokenExpiry: Date;
    };
  };
  
  savedPosts?: mongoose.Schema.Types.ObjectId[];
  sharedPosts?: mongoose.Schema.Types.ObjectId[];

  // --- GAMIFICATION FIELDS ---
  xp: number;
  badges: string[];

  // --- MEDITATION FIELDS ---
  meditationPreferences?: {
    goals?: string[];
    preferredDuration?: number;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night';
    reminders?: boolean;
    reminderTime?: string;
  };
  meditationStats?: {
    totalSessions?: number;
    totalMinutes?: number;
    longestStreak?: number;
    currentStreak?: number;
    lastMeditationDate?: Date;
    favoriteCategories?: string[];
  };
  savedMeditations?: mongoose.Schema.Types.ObjectId[];
  meditationContentType?: string;
  downloadedMeditations?: mongoose.Schema.Types.ObjectId[];
  downloadContentType?: string;
  isPremium?: boolean;

  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  dailyCalorieGoal: { type: Number, default: 2000 },
  streak: { type: Number, default: 0 },
  lastStreakUpdate: { type: Date },
  
  // Profile fields
  profilePictureUrl: { type: String, default: '' },
  bio: { type: String, trim: true, default: '' },
  location: { type: String, trim: true, default: '' },
  
  // Social media links (public handles)
  socialLinks: {
    twitter: { type: String, trim: true, default: '' },
    instagram: { type: String, trim: true, default: '' },
    facebook: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' }
  },
  
  // Social media authentication (OAuth tokens)
  socialMediaAuth: {
    instagram: {
      userId: { type: String },
      accessToken: { type: String },
      tokenExpiry: { type: Date }
    },
    facebook: {
      userId: { type: String },
      accessToken: { type: String },
      tokenExpiry: { type: Date }
    },
    twitter: {
      userId: { type: String },
      accessToken: { type: String },
      accessSecret: { type: String },
      tokenExpiry: { type: Date }
    }
  },
  
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  sharedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
  // Gamification fields
  xp: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String], // An array of strings
    default: []
  },

  // Meditation fields
  meditationPreferences: {
    goals: { type: [String], default: [] },
    preferredDuration: { type: Number, default: 5 },
    experienceLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    preferredTime: { 
      type: String, 
      enum: ['morning', 'afternoon', 'evening', 'night'],
      default: 'morning'
    },
    reminders: { type: Boolean, default: false },
    reminderTime: { type: String, default: '08:00' }
  },
  meditationStats: {
    totalSessions: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastMeditationDate: { type: Date },
    favoriteCategories: { type: [String], default: [] }
  },
  savedMeditations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'meditationContentType' 
  }],
  meditationContentType: {
    type: String,
    enum: ['Meditation', 'SleepContent'],
    default: 'Meditation'
  },
  downloadedMeditations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'downloadContentType' 
  }],
  downloadContentType: {
    type: String,
    enum: ['Meditation', 'SleepContent'],
    default: 'Meditation'
  },
  isPremium: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

// pre-save hook for password hashing
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// matchPassword method
UserSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
