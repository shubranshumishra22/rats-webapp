// server/src/routes/user.routes.ts

import express from 'express';
// Import all the controller functions
import { 
  updateUserGoal, 
  getMyProfile, 
  getUserProfileByUsername, 
  getUserPosts,
  updateUserProfile
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Route to get the logged-in user's own full profile data (including saved posts)
router.route('/profile/me').get(protect, getMyProfile);

// Route to get any user's public profile by their username
router.route('/profile/:username').get(protect, getUserProfileByUsername);

// Route to get all posts created by a specific user
router.route('/profile/:username/posts').get(protect, getUserPosts);

// Route to update the user's calorie goal
router.route('/goal').put(protect, updateUserGoal);

// Route to update the user's profile information
router.route('/profile').put(protect, updateUserProfile);

export default router;
