// server/src/models/nutritionProfile.model.ts

import mongoose from 'mongoose';

const nutritionProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    // Basic nutrition goals
    calorieGoal: {
      type: Number,
      default: 2000
    },
    proteinGoal: {
      type: Number,
      default: 50
    },
    carbsGoal: {
      type: Number,
      default: 250
    },
    fatGoal: {
      type: Number,
      default: 70
    },
    
    // Dietary preferences
    dietType: {
      type: String,
      enum: ['standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean', 'custom'],
      default: 'standard'
    },
    cuisinePreferences: {
      type: [String],
      default: []
    },
    allergies: {
      type: [String],
      default: []
    },
    intolerances: {
      type: [String],
      default: []
    },
    dislikedFoods: {
      type: [String],
      default: []
    },
    favoriteFoods: {
      type: [String],
      default: []
    },
    
    // Health metrics
    weight: {
      type: Number,
      default: 70
    },
    height: {
      type: Number,
      default: 170
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
      default: 'moderately_active'
    },
    healthGoals: {
      type: [String],
      default: ['maintain weight']
    },
    
    // Personalization
    mealSizePreference: {
      type: String,
      enum: ['small_frequent', 'medium_regular', 'large_infrequent'],
      default: 'medium_regular'
    },
    budgetLevel: {
      type: String,
      enum: ['economic', 'moderate', 'premium'],
      default: 'moderate'
    },
    cookingSkill: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    cookingTime: {
      type: String,
      enum: ['minimal', 'moderate', 'extensive'],
      default: 'moderate'
    },
    
    // Regional customization
    region: {
      type: String,
      default: 'United States'
    },
    localFoodPreferences: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const NutritionProfile = mongoose.model('NutritionProfile', nutritionProfileSchema);

export default NutritionProfile;