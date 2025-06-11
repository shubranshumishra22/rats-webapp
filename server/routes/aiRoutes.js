// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to get the Gemini model
const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

// POST /api/ai/meditation-guidance - Get personalized meditation guidance
router.post('/meditation-guidance', auth, async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const model = getGeminiModel();

    // Build a context-aware prompt
    let enhancedPrompt = `As a meditation guide, provide personalized guidance. ${prompt}`;
    
    if (context) {
      if (context.userMood) {
        enhancedPrompt += ` The user is feeling ${context.userMood} today.`;
      }
      
      if (context.meditationHistory) {
        enhancedPrompt += ` They have completed ${context.meditationHistory.totalSessions} meditation sessions totaling ${context.meditationHistory.totalMinutes} minutes.`;
        enhancedPrompt += ` They recently practiced: ${context.meditationHistory.recentCategories.join(', ')}.`;
        enhancedPrompt += ` Their preferred duration is around ${context.meditationHistory.preferredDuration} minutes.`;
      }
      
      if (context.timeOfDay) {
        enhancedPrompt += ` It's currently ${context.timeOfDay}.`;
      }
      
      if (context.userGoals && context.userGoals.length > 0) {
        enhancedPrompt += ` Their meditation goals include: ${context.userGoals.join(', ')}.`;
      }
    }
    
    enhancedPrompt += ` Respond in JSON format with these fields: 
    {
      "text": "main guidance message in a warm, supportive tone",
      "suggestions": ["3-5 specific meditation suggestions based on context"],
      "mood": "identified mood or emotional state",
      "meditationTips": ["2-3 helpful meditation tips"],
      "customPrompt": "a short custom meditation prompt they can use right now"
    }`;

    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jsonResponse = JSON.parse(text);
      return res.json(jsonResponse);
    } catch (parseError) {
      // If parsing fails, return the raw text in our expected format
      return res.json({
        text: text,
        suggestions: ["Mindful breathing", "Body scan", "Loving-kindness meditation"],
        mood: context?.userMood || "neutral",
        meditationTips: ["Find a quiet space", "Start with just a few minutes", "Be kind to yourself"],
        customPrompt: "Take three deep breaths and notice how your body feels right now."
      });
    }
  } catch (error) {
    console.error('Error getting AI meditation guidance:', error);
    res.status(500).json({ 
      message: 'Error generating meditation guidance',
      error: error.message
    });
  }
});

// POST /api/ai/generate-meditation - Generate custom meditation script
router.post('/generate-meditation', auth, async (req, res) => {
  try {
    const { theme, duration, focus } = req.body;
    const model = getGeminiModel();

    const prompt = `Create a guided meditation script with the theme "${theme}" that takes about ${duration} minutes to read slowly. 
    The meditation should focus on ${focus}. 
    Include clear instructions for breathing, body awareness, and mindfulness techniques.
    The tone should be calming, supportive, and gentle.
    Structure it with an introduction, main practice, and conclusion.
    Do not include timestamps or section headers in the output.
    Write in second person (you/your) addressing the meditator directly.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const script = response.text();
    
    res.json({ script });
  } catch (error) {
    console.error('Error generating meditation script:', error);
    res.status(500).json({ 
      message: 'Error generating meditation script',
      error: error.message
    });
  }
});

// POST /api/ai/analyze-progress - Analyze meditation progress
router.post('/analyze-progress', auth, async (req, res) => {
  try {
    const { progressData } = req.body;
    const model = getGeminiModel();

    const prompt = `Analyze this meditation progress data and provide insights and recommendations:
    ${JSON.stringify(progressData)}
    
    Respond in JSON format with these fields:
    {
      "insights": "2-3 sentences about patterns, achievements, and areas for growth",
      "strengths": ["list of 2-3 strengths based on the data"],
      "recommendations": ["list of 3-4 specific, actionable recommendations"],
      "streakMessage": "encouraging message about their streak or consistency",
      "nextMilestone": "suggestion for next milestone to aim for"
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jsonResponse = JSON.parse(text);
      return res.json(jsonResponse);
    } catch (parseError) {
      // If parsing fails, return a default response
      return res.json({
        insights: "You're making steady progress in your meditation journey. Your consistency shows dedication to your practice.",
        strengths: ["Regular practice", "Exploring different meditation types"],
        recommendations: ["Try increasing session duration gradually", "Explore mindfulness meditation", "Consider adding an evening session"],
        streakMessage: "Keep up your meditation streak! Consistency is key to experiencing the benefits.",
        nextMilestone: "Aim for a 10-day consecutive meditation streak"
      });
    }
  } catch (error) {
    console.error('Error analyzing meditation progress:', error);
    res.status(500).json({ 
      message: 'Error analyzing meditation progress',
      error: error.message
    });
  }
});

// POST /api/ai/sleep-story-ideas - Get personalized sleep story ideas
router.post('/sleep-story-ideas', auth, async (req, res) => {
  try {
    const { mood } = req.body;
    const model = getGeminiModel();

    const prompt = `Generate 5 sleep story ideas that would help someone who is feeling ${mood || 'tired'} to fall asleep.
    Each idea should have a title and a brief 1-2 sentence description.
    The stories should be calming, peaceful, and conducive to sleep.
    Respond in JSON format as an array of objects with title and description fields.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the JSON response
    try {
      const jsonResponse = JSON.parse(text);
      return res.json({ ideas: jsonResponse });
    } catch (parseError) {
      // If parsing fails, return default ideas
      return res.json({
        ideas: [
          { title: "Moonlit Forest Walk", description: "A gentle stroll through a peaceful forest under moonlight, with the soft sounds of nature lulling you to sleep." },
          { title: "Ocean Waves Retreat", description: "Relaxing by the ocean as gentle waves wash ashore, feeling the warm breeze and soft sand." },
          { title: "Cozy Mountain Cabin", description: "Sheltered in a warm cabin while snow falls outside, wrapped in a soft blanket by a crackling fireplace." },
          { title: "Floating Among the Stars", description: "A weightless journey through the night sky, drifting peacefully among twinkling stars and distant galaxies." },
          { title: "Secret Garden Sanctuary", description: "Discovering a hidden garden filled with fragrant flowers, gentle fountains, and butterflies dancing in the sunshine." }
        ]
      });
    }
  } catch (error) {
    console.error('Error generating sleep story ideas:', error);
    res.status(500).json({ 
      message: 'Error generating sleep story ideas',
      error: error.message
    });
  }
});

module.exports = router;