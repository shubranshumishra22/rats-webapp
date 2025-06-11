// server/src/services/nutrition.service.ts

import NutritionProfile from '../models/nutritionProfile.model';
import NutritionBehavior from '../models/nutritionBehavior.model';
import MealPlan from '../models/mealPlan.model';
import FoodRecommendation from '../models/foodRecommendation.model';
import FoodLog from '../models/foodLog.model';
import User from '../models/user.model';
import { generateAIResponse } from './ai.service';

/**
 * Create or update a user's nutrition profile
 */
export const createOrUpdateNutritionProfile = async (userId: string, profileData: any) => {
  try {
    // Check if profile exists
    let profile = await NutritionProfile.findOne({ user: userId });
    
    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      await profile.save();
    } else {
      // Create new profile
      profile = new NutritionProfile({
        user: userId,
        ...profileData
      });
      await profile.save();
    }
    
    return profile;
  } catch (error) {
    console.error('Error in createOrUpdateNutritionProfile:', error);
    throw error;
  }
};

/**
 * Generate a meal plan for a user
 */
export const generateMealPlan = async (userId: string, date: Date) => {
  try {
    // Get user's nutrition profile
    const profile = await NutritionProfile.findOne({ user: userId });
    
    if (!profile) {
      throw new Error('Nutrition profile not found');
    }
    
    // Get user data
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get recent food logs to understand preferences
    const recentLogs = await FoodLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Get recent behavior data
    const recentBehaviors = await NutritionBehavior.find({ user: userId })
      .sort({ date: -1 })
      .limit(7);
    
    // Prepare context for AI
    const context = {
      profile,
      user: {
        username: user.username,
        weight: profile.weight,
        height: profile.height,
        activityLevel: profile.activityLevel
      },
      recentFoods: recentLogs.map(log => ({
        name: log.foodName,
        category: log.category,
        timestamp: log.createdAt
      })),
      dietaryPreferences: {
        dietType: profile.dietType,
        cuisinePreferences: profile.cuisinePreferences,
        allergies: profile.allergies,
        intolerances: profile.intolerances,
        dislikedFoods: profile.dislikedFoods,
        favoriteFoods: profile.favoriteFoods
      },
      nutritionGoals: {
        calorieGoal: profile.calorieGoal,
        proteinGoal: profile.proteinGoal,
        carbsGoal: profile.carbsGoal,
        fatGoal: profile.fatGoal
      },
      behaviors: recentBehaviors.map(b => ({
        date: b.date,
        mealTiming: b.mealTiming,
        snackingFrequency: b.snackingFrequency,
        waterIntake: b.waterIntake,
        hungerLevels: b.hungerLevels
      })),
      date: date.toISOString()
    };
    
    // Generate meal plan using AI
    const prompt = `
      Generate a personalized meal plan for the user based on their nutrition profile, recent food logs, and dietary preferences.
      The meal plan should include breakfast, lunch, dinner, and optional snacks.
      For each meal, include:
      - Name of the meal
      - List of ingredients with portions
      - Nutritional information (calories, protein, carbs, fat)
      - Brief preparation instructions
      - Suggested time to eat
      
      The meal plan should meet the user's daily nutritional goals:
      - Calories: ${profile.calorieGoal}
      - Protein: ${profile.proteinGoal}g
      - Carbs: ${profile.carbsGoal}g
      - Fat: ${profile.fatGoal}g
      
      Consider the user's dietary preferences:
      - Diet type: ${profile.dietType}
      - Cuisine preferences: ${profile.cuisinePreferences.join(', ')}
      - Allergies: ${profile.allergies.join(', ')}
      - Intolerances: ${profile.intolerances.join(', ')}
      - Disliked foods: ${profile.dislikedFoods.join(', ')}
      - Favorite foods: ${profile.favoriteFoods.join(', ')}
      
      The meal plan should be for ${date.toDateString()}.
      
      Format the response as a JSON object with the following structure:
      {
        "date": "YYYY-MM-DD",
        "totalCalories": number,
        "totalProtein": number,
        "totalCarbs": number,
        "totalFat": number,
        "meals": [
          {
            "type": "breakfast|lunch|dinner|snack",
            "time": "HH:MM AM/PM",
            "totalCalories": number,
            "items": [
              {
                "name": "string",
                "portion": "string",
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "ingredients": ["string"],
                "recipe": "string",
                "alternatives": ["string"]
              }
            ],
            "notes": "string"
          }
        ],
        "notes": "string"
      }
      
      Context: ${JSON.stringify(context)}
    `;
    
    const aiResponse = await generateAIResponse(prompt);
    
    // Parse AI response
    let mealPlanData;
    try {
      mealPlanData = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to generate meal plan');
    }
    
    // Create meal plan in database
    const mealPlan = new MealPlan({
      user: userId,
      date,
      totalCalories: mealPlanData.totalCalories,
      totalProtein: mealPlanData.totalProtein,
      totalCarbs: mealPlanData.totalCarbs,
      totalFat: mealPlanData.totalFat,
      meals: mealPlanData.meals,
      notes: mealPlanData.notes
    });
    
    await mealPlan.save();
    
    return mealPlan;
  } catch (error) {
    console.error('Error in generateMealPlan:', error);
    throw error;
  }
};

/**
 * Get the active meal plan for a user on a specific date
 */
export const getActiveMealPlan = async (userId: string, date: Date) => {
  try {
    // Set to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find meal plan for the specified date
    const mealPlan = await MealPlan.findOne({
      user: userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    return mealPlan;
  } catch (error) {
    console.error('Error in getActiveMealPlan:', error);
    throw error;
  }
};

/**
 * Get food recommendations for a user
 */
export const getFoodRecommendations = async (userId: string) => {
  try {
    // Get existing recommendations that haven't been rejected
    const existingRecommendations = await FoodRecommendation.find({
      user: userId,
      rejected: { $ne: true }
    });
    
    // If we have enough recommendations, return them
    if (existingRecommendations.length >= 5) {
      return existingRecommendations;
    }
    
    // Otherwise, generate new recommendations
    const profile = await NutritionProfile.findOne({ user: userId });
    
    if (!profile) {
      throw new Error('Nutrition profile not found');
    }
    
    // Get recent food logs
    const recentLogs = await FoodLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Get recent behavior data
    const recentBehaviors = await NutritionBehavior.find({ user: userId })
      .sort({ date: -1 })
      .limit(7);
    
    // Prepare context for AI
    const context = {
      profile,
      recentFoods: recentLogs.map(log => ({
        name: log.foodName,
        category: log.category,
        timestamp: log.createdAt
      })),
      dietaryPreferences: {
        dietType: profile.dietType,
        cuisinePreferences: profile.cuisinePreferences,
        allergies: profile.allergies,
        intolerances: profile.intolerances,
        dislikedFoods: profile.dislikedFoods,
        favoriteFoods: profile.favoriteFoods
      },
      nutritionGoals: {
        calorieGoal: profile.calorieGoal,
        proteinGoal: profile.proteinGoal,
        carbsGoal: profile.carbsGoal,
        fatGoal: profile.fatGoal
      },
      behaviors: recentBehaviors.map(b => ({
        date: b.date,
        mealTiming: b.mealTiming,
        snackingFrequency: b.snackingFrequency,
        waterIntake: b.waterIntake,
        hungerLevels: b.hungerLevels
      }))
    };
    
    // Generate recommendations using AI
    const prompt = `
      Generate personalized food recommendations for the user based on their nutrition profile, recent food logs, and dietary preferences.
      
      Consider the user's dietary preferences:
      - Diet type: ${profile.dietType}
      - Cuisine preferences: ${profile.cuisinePreferences.join(', ')}
      - Allergies: ${profile.allergies.join(', ')}
      - Intolerances: ${profile.intolerances.join(', ')}
      - Disliked foods: ${profile.dislikedFoods.join(', ')}
      - Favorite foods: ${profile.favoriteFoods.join(', ')}
      
      Generate 5 food recommendations that:
      1. Align with the user's dietary preferences
      2. Help meet their nutritional goals
      3. Provide variety from their recent food logs
      4. Are appropriate for their health goals
      
      Format the response as a JSON array with the following structure for each recommendation:
      [
        {
          "foodName": "string",
          "category": "string",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number,
          "fiber": number,
          "portion": "string",
          "nutritionalBenefits": ["string"],
          "whyRecommended": "string",
          "bestTimeToConsume": "breakfast|lunch|dinner|snack",
          "preparationMethods": ["string"],
          "quickRecipe": "string"
        }
      ]
      
      Context: ${JSON.stringify(context)}
    `;
    
    const aiResponse = await generateAIResponse(prompt);
    
    // Parse AI response
    let recommendationsData;
    try {
      recommendationsData = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to generate food recommendations');
    }
    
    // Create recommendations in database
    const newRecommendations = [];
    
    for (const recData of recommendationsData) {
      const recommendation = new FoodRecommendation({
        user: userId,
        ...recData,
        accepted: false,
        rejected: false,
        createdAt: new Date()
      });
      
      await recommendation.save();
      newRecommendations.push(recommendation);
    }
    
    // Return combined recommendations
    return [...existingRecommendations, ...newRecommendations];
  } catch (error) {
    console.error('Error in getFoodRecommendations:', error);
    throw error;
  }
};

/**
 * Log nutrition behavior for a user
 */
export const logNutritionBehavior = async (userId: string, behaviorData: any) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if behavior already logged for today
    let behavior = await NutritionBehavior.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });
    
    if (behavior) {
      // Update existing behavior
      Object.assign(behavior, behaviorData);
      await behavior.save();
    } else {
      // Create new behavior
      behavior = new NutritionBehavior({
        user: userId,
        date: today,
        ...behaviorData
      });
      await behavior.save();
    }
    
    return behavior;
  } catch (error) {
    console.error('Error in logNutritionBehavior:', error);
    throw error;
  }
};

/**
 * Analyze nutrition behavior for a user
 */
export const analyzeNutritionBehavior = async (userId: string) => {
  try {
    // Get user's nutrition profile
    const profile = await NutritionProfile.findOne({ user: userId });
    
    if (!profile) {
      throw new Error('Nutrition profile not found');
    }
    
    // Get behavior data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const behaviors = await NutritionBehavior.find({
      user: userId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });
    
    // Get food logs for the last 30 days
    const foodLogs = await FoodLog.find({
      user: userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });
    
    // Prepare context for AI
    const context = {
      profile,
      behaviors: behaviors.map(b => ({
        date: b.date,
        mealTiming: b.mealTiming,
        snackingFrequency: b.snackingFrequency,
        waterIntake: b.waterIntake,
        hungerLevels: b.hungerLevels,
        mood: b.mood,
        stress: b.stress,
        sleep: b.sleep,
        cravings: b.cravings
      })),
      foodLogs: foodLogs.map(log => ({
        date: log.createdAt,
        foodName: log.foodName,
        category: log.category,
        mealType: log.mealType,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        mood: log.mood,
        hunger: log.hunger,
        fullness: log.fullness
      }))
    };
    
    // Generate analysis using AI
    const prompt = `
      Analyze the user's nutrition behavior based on their behavior logs and food logs from the past 30 days.
      
      Provide insights on:
      1. Eating patterns and habits
      2. Correlation between mood, stress, sleep and eating
      3. Nutritional gaps or excesses
      4. Behavioral patterns that may be helping or hindering their goals
      
      Then provide personalized recommendations for improving their nutrition behavior.
      
      Finally, suggest cognitive-behavioral therapy (CBT) strategies that could help address any identified challenges.
      
      Format the response as a JSON object with the following structure:
      {
        "insights": [
          {
            "category": "string",
            "observation": "string",
            "impact": "string"
          }
        ],
        "patterns": [
          {
            "type": "string",
            "description": "string",
            "frequency": "string"
          }
        ],
        "recommendations": [
          {
            "area": "string",
            "recommendation": "string",
            "implementationSteps": ["string"]
          }
        ],
        "cbtStrategies": [
          {
            "challenge": "string",
            "technique": "string",
            "application": "string"
          }
        ]
      }
      
      Context: ${JSON.stringify(context)}
    `;
    
    const aiResponse = await generateAIResponse(prompt);
    
    // Parse AI response
    let analysisData;
    try {
      analysisData = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      throw new Error('Failed to analyze nutrition behavior');
    }
    
    return analysisData;
  } catch (error) {
    console.error('Error in analyzeNutritionBehavior:', error);
    throw error;
  }
};

/**
 * Calculate nutrition score for a user
 */
export const calculateNutritionScore = async (userId: string) => {
  try {
    // Get user's nutrition profile
    const profile = await NutritionProfile.findOne({ user: userId });
    
    if (!profile) {
      throw new Error('Nutrition profile not found');
    }
    
    // Get food logs for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const foodLogs = await FoodLog.find({
      user: userId,
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Get behavior data for the last 7 days
    const behaviors = await NutritionBehavior.find({
      user: userId,
      date: { $gte: sevenDaysAgo }
    });
    
    // Calculate score based on various factors
    let score = 70; // Base score
    
    // Factor 1: Consistency in logging
    const uniqueDaysLogged = new Set(foodLogs.map(log => 
      new Date(log.createdAt).toDateString()
    )).size;
    
    score += Math.min(uniqueDaysLogged * 3, 15); // Up to 15 points for logging all 7 days
    
    // Factor 2: Meeting calorie goals
    if (profile.calorieGoal) {
      const daysWithinCalorieGoal = foodLogs.reduce((count, log) => {
        const logDate = new Date(log.createdAt).toDateString();
        const dayLogs = foodLogs.filter(l => 
          new Date(l.createdAt).toDateString() === logDate
        );
        
        const totalCalories = dayLogs.reduce((sum, l) => sum + l.calories, 0);
        const isWithinRange = totalCalories >= profile.calorieGoal * 0.85 && 
                              totalCalories <= profile.calorieGoal * 1.15;
        
        return isWithinRange ? count + 1 : count;
      }, 0);
      
      score += Math.min(daysWithinCalorieGoal * 2, 10); // Up to 10 points
    }
    
    // Factor 3: Protein intake
    if (profile.proteinGoal) {
      const avgProtein = foodLogs.reduce((sum, log) => sum + log.protein, 0) / 
                         Math.max(uniqueDaysLogged, 1);
      
      const proteinRatio = avgProtein / profile.proteinGoal;
      if (proteinRatio >= 0.9) {
        score += 5;
      }
    }
    
    // Factor 4: Water intake
    const avgWaterIntake = behaviors.reduce((sum, b) => sum + (b.waterIntake || 0), 0) / 
                           Math.max(behaviors.length, 1);
    
    if (avgWaterIntake >= 8) {
      score += 5;
    } else if (avgWaterIntake >= 6) {
      score += 3;
    }
    
    // Factor 5: Variety in diet
    const uniqueFoods = new Set(foodLogs.map(log => log.foodName.toLowerCase())).size;
    if (uniqueFoods >= 15) {
      score += 5;
    } else if (uniqueFoods >= 10) {
      score += 3;
    }
    
    // Ensure score is within 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    return Math.round(score);
  } catch (error) {
    console.error('Error in calculateNutritionScore:', error);
    throw error;
  }
};

/**
 * Analyze food image
 */
export const analyzeFoodImage = async (imageData: string) => {
  try {
    // Generate analysis using AI
    const prompt = `
      Analyze the food image and identify the food items present.
      For each identified food item, provide:
      1. Name of the food
      2. Estimated portion size
      3. Nutritional information (calories, protein, carbs, fat, fiber)
      4. Food category
      5. Health benefits
      
      Also provide an overall analysis of the meal including:
      1. Total estimated calories
      2. Nutritional quality score (1-10)
      3. Potential health benefits
      4. Potential concerns
      
      Format the response as a JSON object with the following structure:
      {
        "identifiedFoods": [
          {
            "name": "string",
            "portion": "string",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number,
            "fiber": number,
            "sugar": number,
            "category": "string"
          }
        ],
        "totalNutrition": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        },
        "analysis": {
          "quality": number,
          "benefits": ["string"],
          "concerns": ["string"]
        }
      }
    `;
    
    // In a real implementation, we would send the image to an AI vision model
    // For now, we'll simulate a response
    const simulatedResponse = {
      identifiedFoods: [
        {
          name: "Grilled Chicken Breast",
          portion: "4 oz (113g)",
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0,
          category: "Protein"
        },
        {
          name: "Brown Rice",
          portion: "1 cup cooked (195g)",
          calories: 216,
          protein: 5,
          carbs: 45,
          fat: 1.8,
          fiber: 3.5,
          sugar: 0.7,
          category: "Grain"
        },
        {
          name: "Steamed Broccoli",
          portion: "1 cup (156g)",
          calories: 55,
          protein: 3.7,
          carbs: 11.2,
          fat: 0.6,
          fiber: 5.1,
          sugar: 2.6,
          category: "Vegetable"
        }
      ],
      totalNutrition: {
        calories: 436,
        protein: 39.7,
        carbs: 56.2,
        fat: 6
      },
      analysis: {
        quality: 9,
        benefits: [
          "High in protein which supports muscle maintenance",
          "Good source of fiber from vegetables and whole grains",
          "Low in added sugars and unhealthy fats",
          "Contains a variety of nutrients from different food groups"
        ],
        concerns: [
          "Could include more healthy fats from sources like avocado or olive oil",
          "Consider adding more colorful vegetables for additional antioxidants"
        ]
      }
    };
    
    return simulatedResponse;
  } catch (error) {
    console.error('Error in analyzeFoodImage:', error);
    throw error;
  }
};

/**
 * Analyze food text description
 */
export const analyzeFoodText = async (text: string) => {
  try {
    // Generate analysis using AI
    const prompt = `
      Analyze the food description: "${text}"
      
      Identify the food items mentioned and provide:
      1. Name of the food
      2. Estimated portion size
      3. Nutritional information (calories, protein, carbs, fat)
      4. Food category
      5. Health benefits
      
      Format the response as a JSON object with the following structure:
      {
        "foodName": "string",
        "portion": "string",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "category": "string",
        "keyNutrients": ["string"],
        "benefits": ["string"]
      }
    `;
    
    const aiResponse = await generateAIResponse(`${prompt}\n\nFood description: ${text}`);
    
    // Parse AI response
    let analysisData;
    try {
      analysisData = JSON.parse(aiResponse);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback response if parsing fails
      return {
        foodName: text,
        portion: "1 serving",
        calories: 200,
        protein: 10,
        carbs: 25,
        fat: 8,
        category: "Mixed",
        keyNutrients: ["Protein", "Carbohydrates", "Fats"],
        benefits: ["Provides energy", "Contains essential nutrients"]
      };
    }
    
    return analysisData;
  } catch (error) {
    console.error('Error in analyzeFoodText:', error);
    throw error;
  }
};