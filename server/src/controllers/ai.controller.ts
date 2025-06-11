// server/src/controllers/ai.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fetch from 'node-fetch';

/**
 * @desc    Analyze a food image for nutritional content using Gemini
 * @route   POST /api/ai/analyze-image
 * @access  Private
 */
export const analyzeFoodImageController = asyncHandler(async (req: Request, res: Response) => {
  const { image } = req.body;

  if (!image) {
    res.status(400); throw new Error('Image data is required.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500); throw new Error('AI service is not configured on the server.');
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const prompt = `Analyze the food in this image. Provide a realistic estimate for the main food item's name, total calories, protein, carbohydrates, and fats in grams. Respond ONLY with a valid JSON object in the format: {"foodName": "string", "calories": number, "protein": number, "carbs": number, "fat": number}.`;
    const base64Image = image.startsWith('data:') ? image.split(',')[1] : image;
    const requestBody = { contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: "image/jpeg", data: base64Image } }] }] };

    const apiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });

    if (!apiResponse.ok) { throw new Error('Error analyzing food with AI.'); }
    const responseData: any = await apiResponse.json();
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) { throw new Error('AI returned an unexpected response format.'); }

    const jsonString = responseData.candidates[0].content.parts[0].text;
    const cleanedJsonString = jsonString.replace(/```json|```/g, '').trim();
    const nutritionalInfo = JSON.parse(cleanedJsonString);
    res.status(200).json(nutritionalInfo);

  } catch (error: any) {
    console.error("Error in AI Controller:", error.message);
    res.status(500).json({ message: error.message || 'Failed to process AI request.' });
  }
});


/**
 * @desc    Analyze a food description text for nutritional content using Gemini
 * @route   POST /api/ai/analyze-text
 * @access  Private
 */
export const analyzeFoodTextController = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    res.status(400);
    throw new Error('A non-empty text description is required.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500);
    throw new Error('AI service is not configured on the server.');
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const prompt = `Analyze the following food description: "${text}". Provide a realistic estimate for the total calories, protein, carbohydrates, and fats in grams. Use the description as the 'foodName'. Respond ONLY with a valid JSON object in the format: {"foodName": "string", "calories": number, "protein": number, "carbs": number, "fat": number}.`;
    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestBody) });

    if (!apiResponse.ok) { throw new Error('Error analyzing food text with AI.'); }
    const responseData: any = await apiResponse.json();
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) { throw new Error('AI returned an unexpected response format.'); }
    
    const jsonString = responseData.candidates[0].content.parts[0].text;
    const cleanedJsonString = jsonString.replace(/```json|```/g, '').trim();
    const nutritionalInfo = JSON.parse(cleanedJsonString);
    res.status(200).json(nutritionalInfo);

  } catch (error: any) {
    console.error("Error in Text AI Controller:", error.message);
    res.status(500).json({ message: error.message || 'Failed to process AI text request.' });
  }
});

/**
 * @desc    Get personalized meditation guidance using Gemini
 * @route   POST /api/ai/meditation-guidance
 * @access  Private
 */
export const getMeditationGuidanceController = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, context } = req.body;

  if (!prompt) {
    res.status(400);
    throw new Error('Prompt is required for meditation guidance.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500);
    throw new Error('AI service is not configured on the server.');
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
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

    const requestBody = { contents: [{ parts: [{ text: enhancedPrompt }] }] };

    const apiResponse = await fetch(apiUrl, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(requestBody) 
    });

    if (!apiResponse.ok) { 
      throw new Error('Error getting meditation guidance with AI.'); 
    }
    
    const responseData: any = await apiResponse.json();
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) { 
      throw new Error('AI returned an unexpected response format.'); 
    }
    
    const jsonString = responseData.candidates[0].content.parts[0].text;
    const cleanedJsonString = jsonString.replace(/```json|```/g, '').trim();
    
    try {
      const guidanceInfo = JSON.parse(cleanedJsonString);
      res.status(200).json(guidanceInfo);
    } catch (parseError) {
      // If parsing fails, return the raw text in our expected format
      res.status(200).json({
        text: cleanedJsonString,
        suggestions: ["Mindful breathing", "Body scan", "Loving-kindness meditation"],
        mood: context?.userMood || "neutral",
        meditationTips: ["Find a quiet space", "Start with just a few minutes", "Be kind to yourself"],
        customPrompt: "Take three deep breaths and notice how your body feels right now."
      });
    }
  } catch (error: any) {
    console.error("Error in Meditation Guidance Controller:", error.message);
    res.status(500).json({ message: error.message || 'Failed to process meditation guidance request.' });
  }
});

/**
 * @desc    Generate custom meditation script using Gemini
 * @route   POST /api/ai/generate-meditation
 * @access  Private
 */
export const generateMeditationScriptController = asyncHandler(async (req: Request, res: Response) => {
  const { theme, duration, focus } = req.body;

  if (!theme || !duration || !focus) {
    res.status(400);
    throw new Error('Theme, duration, and focus are required for generating a meditation script.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500);
    throw new Error('AI service is not configured on the server.');
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const prompt = `Create a guided meditation script with the theme "${theme}" that takes about ${duration} minutes to read slowly. 
    The meditation should focus on ${focus}. 
    Include clear instructions for breathing, body awareness, and mindfulness techniques.
    The tone should be calming, supportive, and gentle.
    Structure it with an introduction, main practice, and conclusion.
    Do not include timestamps or section headers in the output.
    Write in second person (you/your) addressing the meditator directly.`;

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(apiUrl, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(requestBody) 
    });

    if (!apiResponse.ok) { 
      throw new Error('Error generating meditation script with AI.'); 
    }
    
    const responseData: any = await apiResponse.json();
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) { 
      throw new Error('AI returned an unexpected response format.'); 
    }
    
    const script = responseData.candidates[0].content.parts[0].text;
    res.status(200).json({ script });
  } catch (error: any) {
    console.error("Error in Generate Meditation Script Controller:", error.message);
    res.status(500).json({ message: error.message || 'Failed to generate meditation script.' });
  }
});

/**
 * @desc    Analyze meditation progress using Gemini
 * @route   POST /api/ai/analyze-progress
 * @access  Private
 */
export const analyzeMeditationProgressController = asyncHandler(async (req: Request, res: Response) => {
  const { progressData } = req.body;

  if (!progressData) {
    res.status(400);
    throw new Error('Progress data is required for analysis.');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500);
    throw new Error('AI service is not configured on the server.');
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
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

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(apiUrl, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(requestBody) 
    });

    if (!apiResponse.ok) { 
      throw new Error('Error analyzing meditation progress with AI.'); 
    }
    
    const responseData: any = await apiResponse.json();
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) { 
      throw new Error('AI returned an unexpected response format.'); 
    }
    
    const jsonString = responseData.candidates[0].content.parts[0].text;
    const cleanedJsonString = jsonString.replace(/```json|```/g, '').trim();
    
    try {
      const analysisInfo = JSON.parse(cleanedJsonString);
      res.status(200).json(analysisInfo);
    } catch (parseError) {
      // If parsing fails, return a default response
      res.status(200).json({
        insights: "You're making steady progress in your meditation journey. Your consistency shows dedication to your practice.",
        strengths: ["Regular practice", "Exploring different meditation types"],
        recommendations: ["Try increasing session duration gradually", "Explore mindfulness meditation", "Consider adding an evening session"],
        streakMessage: "Keep up your meditation streak! Consistency is key to experiencing the benefits.",
        nextMilestone: "Aim for a 10-day consecutive meditation streak"
      });
    }
  } catch (error: any) {
    console.error("Error in Analyze Meditation Progress Controller:", error.message);
    res.status(500).json({ message: error.message || 'Failed to analyze meditation progress.' });
  }
});

/**
 * @desc    Get personalized sleep story ideas using Gemini
 * @route   POST /api/ai/sleep-story-ideas
 * @access  Private
 */
export const getSleepStoryIdeasController = asyncHandler(async (req: Request, res: Response) => {
  const { mood } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500);
    throw new Error('AI service is not configured on the server.');
  }

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const prompt = `Generate 5 sleep story ideas that would help someone who is feeling ${mood || 'tired'} to fall asleep.
    Each idea should have a title and a brief 1-2 sentence description.
    The stories should be calming, peaceful, and conducive to sleep.
    Respond in JSON format as an array of objects with title and description fields.`;

    const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

    const apiResponse = await fetch(apiUrl, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(requestBody) 
    });

    if (!apiResponse.ok) { 
      throw new Error('Error generating sleep story ideas with AI.'); 
    }
    
    const responseData: any = await apiResponse.json();
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) { 
      throw new Error('AI returned an unexpected response format.'); 
    }
    
    const jsonString = responseData.candidates[0].content.parts[0].text;
    const cleanedJsonString = jsonString.replace(/```json|```/g, '').trim();
    
    try {
      const storyIdeas = JSON.parse(cleanedJsonString);
      res.status(200).json({ ideas: storyIdeas });
    } catch (parseError) {
      // If parsing fails, return default ideas
      res.status(200).json({
        ideas: [
          { title: "Moonlit Forest Walk", description: "A gentle stroll through a peaceful forest under moonlight, with the soft sounds of nature lulling you to sleep." },
          { title: "Ocean Waves Retreat", description: "Relaxing by the ocean as gentle waves wash ashore, feeling the warm breeze and soft sand." },
          { title: "Cozy Mountain Cabin", description: "Sheltered in a warm cabin while snow falls outside, wrapped in a soft blanket by a crackling fireplace." },
          { title: "Floating Among the Stars", description: "A weightless journey through the night sky, drifting peacefully among twinkling stars and distant galaxies." },
          { title: "Secret Garden Sanctuary", description: "Discovering a hidden garden filled with fragrant flowers, gentle fountains, and butterflies dancing in the sunshine." }
        ]
      });
    }
  } catch (error: any) {
    console.error("Error in Sleep Story Ideas Controller:", error.message);
    res.status(500).json({ message: error.message || 'Failed to generate sleep story ideas.' });
  }
});
