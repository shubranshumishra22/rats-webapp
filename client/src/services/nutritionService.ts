// client/src/services/nutritionService.ts

import axios from 'axios';

const API_URL = 'http://localhost:5001/api/nutrition';

const getAuthHeaders = () => {
  const token = localStorage.getItem('rats_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Nutrition Profile
export const getNutritionProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/profile`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching nutrition profile:', error);
    throw error;
  }
};

export const createOrUpdateProfile = async (profileData: any) => {
  try {
    const response = await axios.post(`${API_URL}/profile`, profileData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating nutrition profile:', error);
    throw error;
  }
};

// Meal Plans
export const generateMealPlan = async (date?: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/meal-plan`, 
      { date: date || new Date().toISOString() }, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw error;
  }
};

export const getActiveMealPlan = async (date?: string) => {
  try {
    const params = date ? { date } : {};
    const response = await axios.get(
      `${API_URL}/meal-plan`, 
      { ...getAuthHeaders(), params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching meal plan:', error);
    throw error;
  }
};

export const updateMealPlan = async (mealPlanId: string, updateData: any) => {
  try {
    const response = await axios.put(
      `${API_URL}/meal-plan/${mealPlanId}`, 
      updateData, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating meal plan:', error);
    throw error;
  }
};

// Food Recommendations
export const getFoodRecommendations = async () => {
  try {
    const response = await axios.get(`${API_URL}/recommendations`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching food recommendations:', error);
    throw error;
  }
};

export const updateRecommendationFeedback = async (recommendationId: string, feedback: { accepted?: boolean, rejected?: boolean }) => {
  try {
    const response = await axios.put(
      `${API_URL}/recommendations/${recommendationId}`, 
      feedback, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating recommendation feedback:', error);
    throw error;
  }
};

// Behavior Tracking
export const logNutritionBehavior = async (behaviorData: any) => {
  try {
    const response = await axios.post(
      `${API_URL}/behavior`, 
      behaviorData, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error logging nutrition behavior:', error);
    throw error;
  }
};

export const getNutritionBehavior = async (date?: string) => {
  try {
    const params = date ? { date } : {};
    const response = await axios.get(
      `${API_URL}/behavior`, 
      { ...getAuthHeaders(), params }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching nutrition behavior:', error);
    throw error;
  }
};

export const analyzeNutritionBehavior = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/analyze-behavior`, 
      {}, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error analyzing nutrition behavior:', error);
    throw error;
  }
};

// Nutrition Score
export const getNutritionScore = async () => {
  try {
    const response = await axios.get(`${API_URL}/score`, getAuthHeaders());
    return response.data.score;
  } catch (error) {
    console.error('Error fetching nutrition score:', error);
    throw error;
  }
};

// Food Logging
export const logFood = async (foodData: any) => {
  try {
    const response = await axios.post(
      `${API_URL}/log-food`, 
      foodData, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error logging food:', error);
    throw error;
  }
};

// Food Analysis
export const analyzeFoodImage = async (imageData: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/analyze-image`, 
      { image: imageData }, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw error;
  }
};

export const analyzeFoodText = async (text: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/analyze-text`, 
      { text }, 
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error('Error analyzing food text:', error);
    throw error;
  }
};