// server/src/models/foodLog.model.ts

import mongoose from 'mongoose';

const foodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    foodName: {
      type: String,
      required: true
    },
    portion: {
      type: String,
      default: '1 serving'
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'snack'
    },
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      default: 0
    },
    fiber: {
      type: Number,
      default: 0
    },
    sugar: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      default: 'Other'
    },
    // Emotional and physical state
    mood: {
      type: String,
      default: 'Neutral'
    },
    hunger: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    fullness: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    },
    // Location and context
    location: {
      type: String,
      default: 'Home'
    },
    socialContext: {
      type: String,
      enum: ['alone', 'family', 'friends', 'colleagues', 'other'],
      default: 'alone'
    },
    // Image data (if available)
    imageUrl: {
      type: String
    },
    // Notes
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const FoodLog = mongoose.model('FoodLog', foodLogSchema);

export default FoodLog;