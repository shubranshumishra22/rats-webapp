// server/src/routes/meditation.routes.ts

import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getAllMeditations,
  getMeditationById,
  getAllCourses,
  getCourseById,
  getAllSleepContent,
  getSleepContentById,
  logMeditationProgress,
  getUserProgress,
  createCustomMeditation,
  getUserCustomMeditations,
  updateCustomMeditation,
  deleteCustomMeditation,
  saveMeditation,
  getSavedMeditations,
  downloadMeditation,
  getDownloadedMeditations,
  updateMeditationPreferences,
  getRecommendations
} from '../controllers/meditation.controller';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Meditation content routes
router.route('/')
  .get(getAllMeditations);

router.route('/:id')
  .get(getMeditationById);

// Course routes
router.route('/courses')
  .get(getAllCourses);

router.route('/courses/:id')
  .get(getCourseById);

// Sleep content routes
router.route('/sleep')
  .get(getAllSleepContent);

router.route('/sleep/:id')
  .get(getSleepContentById);

// Progress tracking routes
router.route('/progress')
  .post(logMeditationProgress)
  .get(getUserProgress);

// Custom meditation routes
router.route('/custom')
  .post(createCustomMeditation)
  .get(getUserCustomMeditations);

router.route('/custom/:id')
  .put(updateCustomMeditation)
  .delete(deleteCustomMeditation);

// Saved and downloaded meditations
router.route('/:id/save')
  .post(saveMeditation);

router.route('/saved')
  .get(getSavedMeditations);

router.route('/:id/download')
  .post(downloadMeditation);

router.route('/downloads')
  .get(getDownloadedMeditations);

// User preferences
router.route('/preferences')
  .put(updateMeditationPreferences);

// Recommendations
router.route('/recommendations')
  .get(getRecommendations);

export default router;