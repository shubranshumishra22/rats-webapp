// server/src/models/mealPlan.model.ts

import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    portion: {
      type: String,
      required: true
    },
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      required: true
    },
    carbs: {
      type: Number,
      required: true
    },
    fat: {
      type: Number,
      required: true
    },
    ingredients: {
      type: [String],
      default: []
    },
    recipe: {
      type: String,
      default: ''
    },
    alternatives: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      required: true
    },
    time: {
      type: String,
      required: true
    },
    totalCalories: {
      type: Number,
      required: true
    },
    items: {
      type: [mealItemSchema],
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const mealPlanSchema = new mongoose.Schema(
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
    totalCalories: {
      type: Number,
      required: true
    },
    totalProtein: {
      type: Number,
      required: true
    },
    totalCarbs: {
      type: Number,
      required: true
    },
    totalFat: {
      type: Number,
      required: true
    },
    meals: {
      type: [mealSchema],
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

export default MealPlan;