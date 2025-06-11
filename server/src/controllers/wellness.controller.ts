// server/src/controllers/wellness.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import WellnessLog from '../models/wellness.model';

// A helper to get the current date in YYYY-MM-DD format
const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * @desc    Create or update a wellness log for today
 * @route   POST /api/wellness
 * @access  Private
 */
export const logOrUpdateWellness = asyncHandler(async (req: Request, res: Response) => {
  const { mood, sleepHours, waterIntake, activity } = req.body;
  const date = getTodayDateString();
  const userId = req.user?._id;

  // Find a log for today and update it, or create a new one if it doesn't exist.
  // The { new: true, upsert: true } options are key here.
  const wellnessLog = await WellnessLog.findOneAndUpdate(
    { user: userId, date: date },
    { $set: { mood, sleepHours, waterIntake, activity } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(wellnessLog);
});

/**
 * @desc    Get the wellness log for today
 * @route   GET /api/wellness/today
 * @access  Private
 */
export const getTodaysWellnessLog = asyncHandler(async (req: Request, res: Response) => {
  const date = getTodayDateString();
  const log = await WellnessLog.findOne({ user: req.user?._id, date: date });

  if (log) {
    res.status(200).json(log);
  } else {
    // It's not an error to not have a log, just send back null
    res.status(200).json(null);
  }
});