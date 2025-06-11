// server/src/controllers/food.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import FoodLog from '../models/foodLog.model';
import User from '../models/user.model';
import { checkAndAwardBadges } from '../services/badge.service';

// Helper function to check if two dates are on the same calendar day
const isSameDay = (date1: Date | undefined, date2: Date) => {
    if(!date1) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

/**
 * @desc    Log a new food item and update streak/XP/badges
 * @route   POST /api/food
 * @access  Private
 */
export const logFood = asyncHandler(async (req: Request, res: Response) => {
  const { foodName, calories, protein, carbs, fat } = req.body;

  if (!foodName || calories === undefined) {
    res.status(400);
    throw new Error('Food name and calories are required.');
  }

  const newLog = await FoodLog.create({
    user: req.user!._id,
    foodName,
    calories,
    protein,
    carbs,
    fat,
  });

  let newBadges: any[] = [];
  const user = await User.findById(req.user!._id);
  if (user) {
    // Award 5 XP for every food log
    user.xp = (user.xp || 0) + 5;

    // Streak Logic
    if (user.dailyCalorieGoal) {
        const today = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todaysLogs = await FoodLog.find({ 
            user: req.user!._id, 
            createdAt: { $gte: startOfToday } 
        });

        const totalCaloriesToday = todaysLogs.reduce((acc, log) => acc + log.calories, 0);

        if (totalCaloriesToday >= user.dailyCalorieGoal && (!user.lastStreakUpdate || !isSameDay(user.lastStreakUpdate, today))) {
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            user.streak = (user.lastStreakUpdate && isSameDay(user.lastStreakUpdate, yesterday)) ? (user.streak || 0) + 1 : 1;
            user.lastStreakUpdate = today;
        }
    }
    
    // Check for any new badges earned
    newBadges = await checkAndAwardBadges(user); // This function will save the user if badges are awarded
    // Save user again in case only XP/streak was updated and not badges
    if (newBadges.length === 0) {
        await user.save();
    }
  }

  res.status(201).json({ newLog, newBadges });
});

/**
 * @desc    Get all food logs for today
 * @route   GET /api/food/today
 * @access  Private
 */
export const getTodaysFood = asyncHandler(async (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const foodLogs = await FoodLog.find({
    user: req.user!._id,
    createdAt: {
      $gte: today,
      $lt: tomorrow,
    },
  }).sort({ createdAt: -1 });

  res.status(200).json(foodLogs);
});

/**
 * @desc    Get the leaderboard (top users by streak)
 * @route   GET /api/food/leaderboard
 * @access  Private
 */
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const leaderboard = await User.find({ streak: { $gt: 0 } })
      .sort({ streak: -1 })
      .limit(100)
      .select('username streak');
  
    res.status(200).json(leaderboard);
});
