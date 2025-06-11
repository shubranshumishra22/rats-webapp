// client/src/services/aiService.ts
import axios from 'axios';

export interface AIResponse {
  text: string;
  suggestions?: string[];
  mood?: string;
  meditationTips?: string[];
  customPrompt?: string;
}

export interface MeditationHistory {
  totalSessions: number;
  totalMinutes: number;
  recentCategories: string[];
  preferredDuration: number;
}

export interface MeditationGuidanceRequest {
  prompt: string;
  context?: {
    userMood?: string;
    meditationHistory?: MeditationHistory;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    userGoals?: string[];
  };
}

export interface MeditationScriptRequest {
  theme: string;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  focus?: string;
  includeMusic?: boolean;
}

export interface MeditationProgressRequest {
  userId: string;
  sessions: number;
  totalMinutes: number;
  streak: number;
  categories: string[];
  goals?: string[];
}

export interface SleepStoryRequest {
  theme?: string;
  duration?: number;
  includeNature?: boolean;
  mood?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('rats_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

const aiService = {
  // Analyze food image
  analyzeFoodImage: async (imageData: string): Promise<any> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/analyze-image',
        { image: imageData },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing food image:', error);
      throw error;
    }
  },

  // Analyze food text
  analyzeFoodText: async (text: string): Promise<any> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/analyze-text',
        { text },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing food text:', error);
      throw error;
    }
  },

  // Get meditation guidance
  getMeditationGuidance: async (request: MeditationGuidanceRequest): Promise<AIResponse> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/meditation-guidance',
        request,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting meditation guidance:', error);
      // Fallback response if API fails
      return {
        text: "Take a moment to center yourself and focus on your breath. Notice how your body feels right now.",
        suggestions: ["Mindful breathing", "Body scan", "Loving-kindness meditation"],
        mood: request.context?.userMood || "neutral",
        meditationTips: ["Find a quiet space", "Start with just a few minutes", "Be kind to yourself"],
        customPrompt: "Take three deep breaths and notice how your body feels right now."
      };
    }
  },

  // Generate meditation script
  generateMeditationScript: async (request: MeditationScriptRequest): Promise<any> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/generate-meditation',
        request,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error generating meditation script:', error);
      throw error;
    }
  },

  // Analyze meditation progress
  analyzeMeditationProgress: async (request: MeditationProgressRequest): Promise<any> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/analyze-progress',
        request,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error analyzing meditation progress:', error);
      throw error;
    }
  },

  // Get sleep story ideas
  getSleepStoryIdeas: async (request: SleepStoryRequest): Promise<any> => {
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/sleep-story-ideas',
        request,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error('Error getting sleep story ideas:', error);
      throw error;
    }
  }
};

export default aiService;