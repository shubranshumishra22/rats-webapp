// server/src/models/foodRecommendation.model.ts

import mongoose from 'mongoose';

const foodRecommendationSchema = new mongoose.Schema(
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
    category: {
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
    fiber: {
      type: Number,
      default: 0
    },
    portion: {
      type: String,
      required: true
    },
    nutritionalBenefits: {
      type: [String],
      default: []
    },
    whyRecommended: {
      type: String,
      required: true
    },
    bestTimeToConsume: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack', 'any_time'],
      default: 'any_time'
    },
    preparationMethods: {
      type: [String],
      default: []
    },
    quickRecipe: {
      type: String,
      default: ''
    },
    accepted: {
      type: Boolean,
      default: false
    },
    rejected: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const FoodRecommendation = mongoose.model('FoodRecommendation', foodRecommendationSchema);

export default FoodRecommendation;