// server/src/routes/ai.routes.ts

import express from 'express';
// Import AI controller functions
import { 
  analyzeFoodImageController, 
  analyzeFoodTextController,
  getMeditationGuidanceController,
  generateMeditationScriptController,
  analyzeMeditationProgressController,
  getSleepStoryIdeasController
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Food analysis routes
router.route('/analyze-image').post(protect, analyzeFoodImageController);
router.route('/analyze-text').post(protect, analyzeFoodTextController);

// Meditation AI routes
router.route('/meditation-guidance').post(protect, getMeditationGuidanceController);
router.route('/generate-meditation').post(protect, generateMeditationScriptController);
router.route('/analyze-progress').post(protect, analyzeMeditationProgressController);
router.route('/sleep-story-ideas').post(protect, getSleepStoryIdeasController);

export default router;
