// server/src/controllers/nutrition.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as nutritionService from '../services/nutrition.service';
import NutritionProfile from '../models/nutritionProfile.model';
import NutritionBehavior from '../models/nutritionBehavior.model';
import MealPlan from '../models/mealPlan.model';
import FoodRecommendation from '../models/foodRecommendation.model';
import FoodLog from '../models/foodLog.model';
import User from '../models/user.model';

/**
 * @desc    Create or update nutrition profile
 * @route   POST /api/nutrition/profile
 * @access  Private
 */
export const createOrUpdateProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const profileData = req.body;
    
    const profile = await nutritionService.createOrUpdateNutritionProfile(userId.toString(), profileData);
    
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Get nutrition profile
 * @route   GET /api/nutrition/profile
 * @access  Private
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const profile = await NutritionProfile.findOne({ user: userId });
    
    if (!profile) {
      res.status(404).json({ message: 'Nutrition profile not found' });
      return;
    }
    
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Generate meal plan
 * @route   POST /api/nutrition/meal-plan
 * @access  Private
 */
export const generateMealPlan = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const { date } = req.body;
    
    const planDate = date ? new Date(date) : new Date();
    
    const mealPlan = await nutritionService.generateMealPlan(userId.toString(), planDate);
    
    res.status(200).json(mealPlan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Get active meal plan
 * @route   GET /api/nutrition/meal-plan
 * @access  Private
 */
export const getActiveMealPlan = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const dateParam = req.query.date as string;
    
    const date = dateParam ? new Date(dateParam) : new Date();
    
    const mealPlan = await nutritionService.getActiveMealPlan(userId.toString(), date);
    
    if (!mealPlan) {
      res.status(404).json({ message: 'No active meal plan found for this date' });
      return;
    }
    
    res.status(200).json(mealPlan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Update meal plan
 * @route   PUT /api/nutrition/meal-plan/:id
 * @access  Private
 */
export const updateMealPlan = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const mealPlanId = req.params.id;
    const updateData = req.body;
    
    // Find the meal plan
    const mealPlan = await MealPlan.findById(mealPlanId);
    
    if (!mealPlan) {
      res.status(404).json({ message: 'Meal plan not found' });
      return;
    }
    
    // Check if the meal plan belongs to the user
    if (mealPlan.user.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized to update this meal plan' });
      return;
    }
    
    // Update the meal plan
    Object.assign(mealPlan, updateData);
    await mealPlan.save();
    
    res.status(200).json(mealPlan);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Get food recommendations
 * @route   GET /api/nutrition/recommendations
 * @access  Private
 */
export const getFoodRecommendations = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const recommendations = await nutritionService.getFoodRecommendations(userId.toString());
    
    res.status(200).json(recommendations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Update recommendation feedback (accept/reject)
 * @route   PUT /api/nutrition/recommendations/:id
 * @access  Private
 */
export const updateRecommendationFeedback = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const recommendationId = req.params.id;
    const { accepted, rejected } = req.body;
    
    // Find the recommendation
    const recommendation = await FoodRecommendation.findById(recommendationId);
    
    if (!recommendation) {
      res.status(404).json({ message: 'Recommendation not found' });
      return;
    }
    
    // Check if the recommendation belongs to the user
    if (recommendation.user.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized to update this recommendation' });
      return;
    }
    
    // Update the recommendation
    if (accepted !== undefined) recommendation.accepted = accepted;
    if (rejected !== undefined) recommendation.rejected = rejected;
    
    await recommendation.save();
    
    res.status(200).json(recommendation);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Log nutrition behavior
 * @route   POST /api/nutrition/behavior
 * @access  Private
 */
export const logNutritionBehavior = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const behaviorData = req.body;
    
    const behavior = await nutritionService.logNutritionBehavior(userId.toString(), behaviorData);
    
    res.status(200).json(behavior);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Get nutrition behavior
 * @route   GET /api/nutrition/behavior
 * @access  Private
 */
export const getNutritionBehavior = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const dateParam = req.query.date as string;
    
    const date = dateParam ? new Date(dateParam) : new Date();
    
    // Set to start of day
    date.setHours(0, 0, 0, 0);
    
    // Find behavior entry for the specified date
    const behavior = await NutritionBehavior.findOne({
      user: userId,
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (!behavior) {
      res.status(404).json({ message: 'No behavior data found for this date' });
      return;
    }
    
    res.status(200).json(behavior);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Analyze nutrition behavior
 * @route   POST /api/nutrition/analyze-behavior
 * @access  Private
 */
export const analyzeNutritionBehavior = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const analysis = await nutritionService.analyzeNutritionBehavior(userId.toString());
    
    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Calculate nutrition score
 * @route   GET /api/nutrition/score
 * @access  Private
 */
export const getNutritionScore = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    
    const score = await nutritionService.calculateNutritionScore(userId.toString());
    
    res.status(200).json({ score });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Log food with enhanced data
 * @route   POST /api/nutrition/log-food
 * @access  Private
 */
export const logFood = asyncHandler(async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    const foodData = req.body;
    
    // Create the food log
    const newLog = new FoodLog({
      user: userId,
      ...foodData
    });
    
    await newLog.save();
    
    // Update user's streak and XP
    const user = await User.findById(userId);
    
    if (user) {
      // Award 5 XP for every food log
      user.xp = (user.xp || 0) + 5;
      
      // Streak logic (similar to existing food controller)
      if (user.dailyCalorieGoal) {
        const today = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        
        const todaysLogs = await FoodLog.find({ 
          user: userId, 
          createdAt: { $gte: startOfToday } 
        });
        
        const totalCaloriesToday = todaysLogs.reduce((acc, log) => acc + log.calories, 0);
        
        const isSameDay = (date1: Date | undefined, date2: Date) => {
          if(!date1) return false;
          return date1.getFullYear() === date2.getFullYear() &&
                 date1.getMonth() === date2.getMonth() &&
                 date1.getDate() === date2.getDate();
        };
        
        if (totalCaloriesToday >= user.dailyCalorieGoal && (!user.lastStreakUpdate || !isSameDay(user.lastStreakUpdate, today))) {
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          user.streak = (user.lastStreakUpdate && isSameDay(user.lastStreakUpdate, yesterday)) ? (user.streak || 0) + 1 : 1;
          user.lastStreakUpdate = today;
        }
      }
      
      await user.save();
    }
    
    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Analyze food image
 * @route   POST /api/nutrition/analyze-image
 * @access  Private
 */
export const analyzeFoodImage = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    
    if (!image) {
      res.status(400).json({ message: 'Image data is required' });
      return;
    }
    
    const analysis = await nutritionService.analyzeFoodImage(image);
    
    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Analyze food text
 * @route   POST /api/nutrition/analyze-text
 * @access  Private
 */
export const analyzeFoodText = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      res.status(400).json({ message: 'Text description is required' });
      return;
    }
    
    const analysis = await nutritionService.analyzeFoodText(text);
    
    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});