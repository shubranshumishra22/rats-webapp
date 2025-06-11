// server/src/models/nutritionBehavior.model.ts

import mongoose from 'mongoose';

const nutritionBehaviorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    // Meal timing (regular, irregular)
    mealTiming: {
      type: String,
      enum: ['very_regular', 'somewhat_regular', 'irregular', 'very_irregular'],
      default: 'somewhat_regular'
    },
    // Snacking frequency
    snackingFrequency: {
      type: String,
      enum: ['none', 'rare', 'occasional', 'frequent', 'very_frequent'],
      default: 'occasional'
    },
    // Water intake (glasses)
    waterIntake: {
      type: Number,
      default: 6
    },
    // Hunger levels throughout day (1-10)
    hungerLevels: {
      morning: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      },
      afternoon: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      },
      evening: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      }
    },
    // Mood and emotional state
    mood: {
      type: String,
      default: 'neutral'
    },
    // Stress level (1-10)
    stress: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    // Sleep quality (1-10)
    sleep: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    // Cravings
    cravings: {
      type: [String],
      default: []
    },
    // Eating environment
    eatingEnvironment: {
      type: String,
      enum: ['home', 'work', 'restaurant', 'on_the_go', 'mixed'],
      default: 'home'
    },
    // Social context
    socialContext: {
      type: String,
      enum: ['alone', 'family', 'friends', 'colleagues', 'mixed'],
      default: 'alone'
    },
    // Mindful eating score (1-10)
    mindfulEating: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    // Notes
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one entry per user per day
nutritionBehaviorSchema.index({ user: 1, date: 1 }, { unique: true });

const NutritionBehavior = mongoose.model('NutritionBehavior', nutritionBehaviorSchema);

export default NutritionBehavior;