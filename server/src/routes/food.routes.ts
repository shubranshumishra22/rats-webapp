// server/src/routes/food.routes.ts

import express from 'express';
// Import all three controller functions
import { logFood, getTodaysFood, getLeaderboard } from '../controllers/food.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Route for logging a new food item
router.route('/').post(protect, logFood);

// Route for getting today's food logs
router.route('/today').get(protect, getTodaysFood);

// Route for getting the streaks leaderboard
router.route('/leaderboard').get(protect, getLeaderboard);

export default router;
