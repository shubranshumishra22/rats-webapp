// server/src/routes/nutrition.routes.ts

import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createOrUpdateProfile,
  getProfile,
  generateMealPlan,
  getActiveMealPlan,
  updateMealPlan,
  getFoodRecommendations,
  updateRecommendationFeedback,
  logNutritionBehavior,
  getNutritionBehavior,
  analyzeNutritionBehavior,
  getNutritionScore,
  logFood,
  analyzeFoodImage,
  analyzeFoodText
} from '../controllers/nutrition.controller';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Nutrition profile routes
router.route('/profile')
  .post(createOrUpdateProfile)
  .get(getProfile);

// Meal plan routes
router.route('/meal-plan')
  .post(generateMealPlan)
  .get(getActiveMealPlan);

router.route('/meal-plan/:id')
  .put(updateMealPlan);

// Food recommendation routes
router.route('/recommendations')
  .get(getFoodRecommendations);

router.route('/recommendations/:id')
  .put(updateRecommendationFeedback);

// Behavior tracking routes
router.route('/behavior')
  .post(logNutritionBehavior)
  .get(getNutritionBehavior);

router.route('/analyze-behavior')
  .post(analyzeNutritionBehavior);

// Nutrition score route
router.route('/score')
  .get(getNutritionScore);

// Food logging routes
router.route('/log-food')
  .post(logFood);

// Food analysis routes
router.route('/analyze-image')
  .post(analyzeFoodImage);

router.route('/analyze-text')
  .post(analyzeFoodText);

export default router;