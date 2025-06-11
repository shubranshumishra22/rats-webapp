// server/src/controllers/meditation.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Meditation from '../models/meditation.model';
import MeditationCourse from '../models/meditationCourse.model';
import SleepContent from '../models/sleepContent.model';
import MeditationProgress from '../models/meditationProgress.model';
import CustomMeditation from '../models/customMeditation.model';
import User from '../models/user.model';
import { checkAndAwardBadges } from '../services/badge.service';

/**
 * @desc    Get all meditations with optional filtering
 * @route   GET /api/meditation
 * @access  Private
 */
export const getAllMeditations = asyncHandler(async (req: Request, res: Response) => {
  const { 
    category, 
    level, 
    duration, 
    search, 
    isPremium 
  } = req.query;

  // Build filter object
  const filter: any = {};
  
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (isPremium !== undefined) filter.isPremium = isPremium === 'true';
  
  // Duration filter (less than or equal to)
  if (duration) {
    filter.duration = { $lte: parseInt(duration as string) };
  }
  
  // Search by title or description
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const meditations = await Meditation.find(filter).sort({ isFeatured: -1, createdAt: -1 });
  res.status(200).json(meditations);
});

/**
 * @desc    Get meditation by ID
 * @route   GET /api/meditation/:id
 * @access  Private
 */
export const getMeditationById = asyncHandler(async (req: Request, res: Response) => {
  const meditation = await Meditation.findById(req.params.id);
  
  if (!meditation) {
    res.status(404);
    throw new Error('Meditation not found');
  }
  
  res.status(200).json(meditation);
});

/**
 * @desc    Get all meditation courses
 * @route   GET /api/meditation/courses
 * @access  Private
 */
export const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
  const { level, isPremium } = req.query;
  
  // Build filter object
  const filter: any = {};
  
  if (level) filter.level = level;
  if (isPremium !== undefined) filter.isPremium = isPremium === 'true';
  
  const courses = await MeditationCourse.find(filter)
    .populate('meditations', 'title duration level')
    .sort({ createdAt: -1 });
    
  res.status(200).json(courses);
});

/**
 * @desc    Get course by ID with all meditations
 * @route   GET /api/meditation/courses/:id
 * @access  Private
 */
export const getCourseById = asyncHandler(async (req: Request, res: Response) => {
  const course = await MeditationCourse.findById(req.params.id)
    .populate('meditations');
  
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  
  res.status(200).json(course);
});

/**
 * @desc    Get all sleep content
 * @route   GET /api/meditation/sleep
 * @access  Private
 */
export const getAllSleepContent = asyncHandler(async (req: Request, res: Response) => {
  const { type, category, isPremium } = req.query;
  
  // Build filter object
  const filter: any = {};
  
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (isPremium !== undefined) filter.isPremium = isPremium === 'true';
  
  const sleepContent = await SleepContent.find(filter).sort({ createdAt: -1 });
  res.status(200).json(sleepContent);
});

/**
 * @desc    Get sleep content by ID
 * @route   GET /api/meditation/sleep/:id
 * @access  Private
 */
export const getSleepContentById = asyncHandler(async (req: Request, res: Response) => {
  const sleepContent = await SleepContent.findById(req.params.id);
  
  if (!sleepContent) {
    res.status(404);
    throw new Error('Sleep content not found');
  }
  
  res.status(200).json(sleepContent);
});

/**
 * @desc    Log completed meditation session
 * @route   POST /api/meditation/progress
 * @access  Private
 */
export const logMeditationProgress = asyncHandler(async (req: Request, res: Response) => {
  const { 
    meditationId, 
    contentType, 
    duration, 
    mood, 
    moodAfter, 
    notes 
  } = req.body;
  
  // Validate required fields
  if (!meditationId || !contentType || !duration || !mood) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  // Create progress record
  const progress = await MeditationProgress.create({
    user: req.user!._id,
    meditation: meditationId,
    contentType,
    completedAt: new Date(),
    duration,
    mood,
    moodAfter,
    notes
  });
  
  // Update user meditation stats
  const user = await User.findById(req.user!._id);
  if (user) {
    // Initialize meditation stats if they don't exist
    if (!user.meditationStats) {
      user.meditationStats = {
        totalSessions: 0,
        totalMinutes: 0,
        longestStreak: 0,
        currentStreak: 0
      };
    }
    
    // Update stats
    user.meditationStats.totalSessions = (user.meditationStats.totalSessions || 0) + 1;
    user.meditationStats.totalMinutes = (user.meditationStats.totalMinutes || 0) + duration;
    
    // Update streak
    const lastMeditationDate = user.meditationStats.lastMeditationDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (lastMeditationDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const lastDate = new Date(lastMeditationDate);
      lastDate.setHours(0, 0, 0, 0);
      
      // If last meditation was yesterday, increment streak
      if (lastDate.getTime() === yesterday.getTime()) {
        user.meditationStats.currentStreak = (user.meditationStats.currentStreak || 0) + 1;
      } 
      // If last meditation was today, keep streak the same
      else if (lastDate.getTime() === today.getTime()) {
        // Do nothing, already meditated today
      } 
      // Otherwise, reset streak to 1
      else {
        user.meditationStats.currentStreak = 1;
      }
    } else {
      // First meditation ever
      user.meditationStats.currentStreak = 1;
    }
    
    // Update longest streak if needed
    if ((user.meditationStats.currentStreak || 0) > (user.meditationStats.longestStreak || 0)) {
      user.meditationStats.longestStreak = user.meditationStats.currentStreak;
    }
    
    // Update last meditation date
    user.meditationStats.lastMeditationDate = new Date();
    
    // Update favorite categories
    let category: string | undefined;
    
    if (contentType === 'Meditation') {
      const content = await Meditation.findById(meditationId);
      if (content) {
        category = content.category;
      }
    } else {
      const content = await SleepContent.findById(meditationId);
      if (content) {
        category = content.category;
      }
    }
    
    if (category) {
      if (!user.meditationStats.favoriteCategories) {
        user.meditationStats.favoriteCategories = [];
      }
      
      if (!user.meditationStats.favoriteCategories.includes(category)) {
        user.meditationStats.favoriteCategories.push(category);
      }
    }
    
    // Award XP for meditation
    user.xp = (user.xp || 0) + 20; // 20 XP for completing a meditation
    
    // Check for badges
    const newBadges = await checkAndAwardBadges(user);
    
    await user.save();
    
    // Return progress with user stats and any new badges
    res.status(201).json({
      progress,
      stats: user.meditationStats,
      newBadges
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Get user meditation progress
 * @route   GET /api/meditation/progress
 * @access  Private
 */
export const getUserProgress = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  
  // Build filter object
  const filter: any = { user: req.user!._id };
  
  // Date range filter
  if (startDate || endDate) {
    filter.completedAt = {};
    if (startDate) filter.completedAt.$gte = new Date(startDate as string);
    if (endDate) filter.completedAt.$lte = new Date(endDate as string);
  }
  
  const progress = await MeditationProgress.find(filter)
    .populate({
      path: 'meditation',
      select: 'title duration category',
      // Use a static model reference instead of a function
      model: 'Meditation'
    })
    .sort({ completedAt: -1 });
  
  // Get user stats
  const user = await User.findById(req.user!._id).select('meditationStats');
  
  res.status(200).json({
    progress,
    stats: user?.meditationStats || {}
  });
});

/**
 * @desc    Create custom meditation
 * @route   POST /api/meditation/custom
 * @access  Private
 */
export const createCustomMeditation = asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, 
    introVoice, 
    breathworkType, 
    backgroundSound, 
    duration 
  } = req.body;
  
  // Validate required fields
  if (!name || !introVoice || !breathworkType || !backgroundSound || !duration) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }
  
  const customMeditation = await CustomMeditation.create({
    user: req.user!._id,
    name,
    introVoice,
    breathworkType,
    backgroundSound,
    duration,
    isFavorite: false
  });
  
  res.status(201).json(customMeditation);
});

/**
 * @desc    Get user's custom meditations
 * @route   GET /api/meditation/custom
 * @access  Private
 */
export const getUserCustomMeditations = asyncHandler(async (req: Request, res: Response) => {
  const customMeditations = await CustomMeditation.find({ user: req.user!._id })
    .sort({ isFavorite: -1, createdAt: -1 });
  
  res.status(200).json(customMeditations);
});

/**
 * @desc    Update custom meditation
 * @route   PUT /api/meditation/custom/:id
 * @access  Private
 */
export const updateCustomMeditation = asyncHandler(async (req: Request, res: Response) => {
  const { 
    name, 
    introVoice, 
    breathworkType, 
    backgroundSound, 
    duration, 
    isFavorite 
  } = req.body;
  
  const customMeditation = await CustomMeditation.findById(req.params.id);
  
  if (!customMeditation) {
    res.status(404);
    throw new Error('Custom meditation not found');
  }
  
  // Check if user owns this custom meditation
  if (customMeditation.user.toString() !== req.user!._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  // Update fields
  if (name) customMeditation.name = name;
  if (introVoice) customMeditation.introVoice = introVoice;
  if (breathworkType) customMeditation.breathworkType = breathworkType;
  if (backgroundSound) customMeditation.backgroundSound = backgroundSound;
  if (duration) customMeditation.duration = duration;
  if (isFavorite !== undefined) customMeditation.isFavorite = isFavorite;
  
  const updatedMeditation = await customMeditation.save();
  
  res.status(200).json(updatedMeditation);
});

/**
 * @desc    Delete custom meditation
 * @route   DELETE /api/meditation/custom/:id
 * @access  Private
 */
export const deleteCustomMeditation = asyncHandler(async (req: Request, res: Response) => {
  const customMeditation = await CustomMeditation.findById(req.params.id);
  
  if (!customMeditation) {
    res.status(404);
    throw new Error('Custom meditation not found');
  }
  
  // Check if user owns this custom meditation
  if (customMeditation.user.toString() !== req.user!._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }
  
  await customMeditation.deleteOne();
  
  res.status(200).json({ message: 'Custom meditation deleted' });
});

/**
 * @desc    Save meditation to user's saved list
 * @route   POST /api/meditation/:id/save
 * @access  Private
 */
export const saveMeditation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { contentType } = req.body;
  
  if (!contentType) {
    res.status(400);
    throw new Error('Content type is required');
  }
  
  // Check if meditation exists
  let content;
  if (contentType === 'Meditation') {
    content = await Meditation.findById(id);
  } else {
    content = await SleepContent.findById(id);
  }
  
  if (!content) {
    res.status(404);
    throw new Error('Content not found');
  }
  
  // Update user's saved meditations
  const user = await User.findById(req.user!._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Initialize saved meditations array if it doesn't exist
  if (!user.savedMeditations) {
    user.savedMeditations = [];
  }
  
  // Check if already saved
  const isSaved = user.savedMeditations.includes(id as any);
  
  if (isSaved) {
    // Remove from saved
    user.savedMeditations = user.savedMeditations.filter(
      (meditationId) => meditationId.toString() !== id
    );
    user.meditationContentType = contentType;
  } else {
    // Add to saved
    user.savedMeditations.push(id as any);
    user.meditationContentType = contentType;
  }
  
  await user.save();
  
  res.status(200).json({
    message: isSaved ? 'Removed from saved' : 'Added to saved',
    isSaved: !isSaved
  });
});

/**
 * @desc    Get user's saved meditations
 * @route   GET /api/meditation/saved
 * @access  Private
 */
export const getSavedMeditations = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id)
    .populate({
      path: 'savedMeditations',
      model: 'Meditation'
    });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json(user.savedMeditations || []);
});

/**
 * @desc    Mark meditation as downloaded
 * @route   POST /api/meditation/:id/download
 * @access  Private
 */
export const downloadMeditation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { contentType } = req.body;
  
  if (!contentType) {
    res.status(400);
    throw new Error('Content type is required');
  }
  
  // Check if meditation exists
  let content;
  if (contentType === 'Meditation') {
    content = await Meditation.findById(id);
  } else {
    content = await SleepContent.findById(id);
  }
  
  if (!content) {
    res.status(404);
    throw new Error('Content not found');
  }
  
  // Check if content is downloadable
  if (!content.isDownloadable) {
    res.status(400);
    throw new Error('This content is not available for download');
  }
  
  // Update user's downloaded meditations
  const user = await User.findById(req.user!._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Initialize downloaded meditations array if it doesn't exist
  if (!user.downloadedMeditations) {
    user.downloadedMeditations = [];
  }
  
  // Check if already downloaded
  const isDownloaded = user.downloadedMeditations.includes(id as any);
  
  if (!isDownloaded) {
    // Add to downloaded
    user.downloadedMeditations.push(id as any);
    user.downloadContentType = contentType;
    await user.save();
  }
  
  res.status(200).json({
    message: 'Added to downloads',
    isDownloaded: true
  });
});

/**
 * @desc    Get user's downloaded meditations
 * @route   GET /api/meditation/downloads
 * @access  Private
 */
export const getDownloadedMeditations = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id)
    .populate({
      path: 'downloadedMeditations',
      model: 'Meditation'
    });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  res.status(200).json(user.downloadedMeditations || []);
});

/**
 * @desc    Update user meditation preferences
 * @route   PUT /api/meditation/preferences
 * @access  Private
 */
export const updateMeditationPreferences = asyncHandler(async (req: Request, res: Response) => {
  const { 
    goals, 
    preferredDuration, 
    experienceLevel, 
    preferredTime, 
    reminders, 
    reminderTime 
  } = req.body;
  
  const user = await User.findById(req.user!._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Initialize meditation preferences if they don't exist
  if (!user.meditationPreferences) {
    user.meditationPreferences = {};
  }
  
  // Update preferences
  if (goals) user.meditationPreferences.goals = goals;
  if (preferredDuration) user.meditationPreferences.preferredDuration = preferredDuration;
  if (experienceLevel) user.meditationPreferences.experienceLevel = experienceLevel;
  if (preferredTime) user.meditationPreferences.preferredTime = preferredTime;
  if (reminders !== undefined) user.meditationPreferences.reminders = reminders;
  if (reminderTime) user.meditationPreferences.reminderTime = reminderTime;
  
  await user.save();
  
  res.status(200).json(user.meditationPreferences);
});

/**
 * @desc    Get recommended meditations based on user preferences and mood
 * @route   GET /api/meditation/recommendations
 * @access  Private
 */
export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { mood } = req.query;
  
  const user = await User.findById(req.user!._id);
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Build filter based on user preferences and current mood
  const filter: any = {};
  
  // Filter by experience level if user has set it
  if (user.meditationPreferences?.experienceLevel) {
    filter.level = user.meditationPreferences.experienceLevel;
  }
  
  // Filter by duration if user has set it
  if (user.meditationPreferences?.preferredDuration) {
    filter.duration = { $lte: user.meditationPreferences.preferredDuration };
  }
  
  // Mood-based category mapping
  if (mood) {
    switch (mood) {
      case 'stressed':
        filter.category = { $in: ['calm', 'anxiety'] };
        break;
      case 'anxious':
        filter.category = { $in: ['anxiety', 'calm'] };
        break;
      case 'sad':
        filter.category = { $in: ['love', 'forgiveness'] };
        break;
      case 'tired':
        filter.category = { $in: ['focus', 'calm'] };
        break;
      case 'happy':
        filter.category = { $in: ['focus', 'love'] };
        break;
      default:
        // No specific category filter
    }
  }
  
  // Get recommendations
  const recommendations = await Meditation.find(filter)
    .sort({ isFeatured: -1 })
    .limit(5);
  
  // Get sleep recommendations if it's evening or night
  let sleepRecommendations: any[] = [];
  if (
    user.meditationPreferences?.preferredTime === 'evening' || 
    user.meditationPreferences?.preferredTime === 'night'
  ) {
    sleepRecommendations = await SleepContent.find({})
      .sort({ createdAt: -1 })
      .limit(3);
  }
  
  res.status(200).json({
    meditations: recommendations,
    sleepContent: sleepRecommendations
  });
});