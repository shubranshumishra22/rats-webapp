// server/src/services/ai.service.ts

import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

// Helper function to make API calls to Gemini API
async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not defined in environment variables');
      throw new Error('API key is missing. Please check your environment configuration.');
    }
    
    console.log(`Making API call to Gemini with prompt length: ${prompt.length} characters`);
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };
    
    // Try the gemini-1.5-flash-latest model with v1beta endpoint as suggested
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    console.log(`Using API endpoint: ${apiUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
    
    let response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    let data = await response.json();
    
    // If the first attempt fails, try gemini-pro with v1 endpoint
    if (!response.ok) {
      console.log('First attempt failed. Trying gemini-pro with v1 endpoint...');
      response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      data = await response.json();
      
      // If that also fails, try one more fallback
      if (!response.ok) {
        console.log('Second attempt failed. Trying one more fallback...');
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        data = await response.json();
      }
    }
    
    if (!response.ok) {
      console.error('All Gemini API attempts failed. Last error response:', data);
      throw new Error(`API error: ${data.error?.message || 'Unknown error'} (Tried multiple models including gemini-1.5-flash-latest)`);
    }
    
    // Extract the generated text, handling different response structures
    let generatedText = '';
    
    console.log('Parsing response structure...');
    
    // Check for candidates structure (v1 and v1beta)
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        // Standard structure for gemini-pro
        generatedText = candidate.content.parts[0].text;
        console.log('Extracted text from standard candidate.content.parts structure');
      } else if (candidate.text) {
        // Alternative structure that might be present in some versions
        generatedText = candidate.text;
        console.log('Extracted text from candidate.text structure');
      } else if (typeof candidate === 'string') {
        // Some versions might return the text directly
        generatedText = candidate;
        console.log('Extracted text from direct candidate string');
      }
    }
    
    // Check for alternative response structures
    if (!generatedText && data.response) {
      if (data.response.text) {
        generatedText = data.response.text;
        console.log('Extracted text from response.text structure');
      } else if (data.response.candidates && data.response.candidates.length > 0) {
        generatedText = data.response.candidates[0].content || data.response.candidates[0].text || '';
        console.log('Extracted text from response.candidates structure');
      }
    }
    
    // Check for gemini-1.5-flash-latest specific structure
    if (!generatedText && data.contents && data.contents.length > 0) {
      for (const content of data.contents) {
        if (content.parts && content.parts.length > 0) {
          for (const part of content.parts) {
            if (part.text) {
              generatedText = part.text;
              console.log('Extracted text from contents.parts.text structure (gemini-1.5-flash)');
              break;
            }
          }
          if (generatedText) break;
        }
      }
    }
    
    // One more check for direct text property
    if (!generatedText && data.text) {
      generatedText = data.text;
      console.log('Extracted text from direct text property');
    }
    
    if (!generatedText) {
      console.error('Could not extract text from Gemini API response. Response structure:', JSON.stringify(data, null, 2));
      throw new Error('No content could be extracted from the AI model response');
    }
    
    console.log(`Successfully generated AI content (${generatedText.length} characters)`);
    
    return generatedText;
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    
    // Provide more specific error messages based on the error type
    if (error.message && error.message.includes('API key')) {
      throw new Error('AI service configuration error: Invalid or missing API key');
    } else if (error.message && error.message.includes('NOT_FOUND')) {
      throw new Error('AI service error: The specified model was not found. Please check your API configuration.');
    } else if (error.message && error.message.includes('PERMISSION_DENIED')) {
      throw new Error('AI service error: Permission denied. Please check your API key permissions.');
    } else if (error.message && error.message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('AI service error: API quota exceeded. Please try again later.');
    } else if (error.message && error.message.includes('extract text')) {
      throw new Error('AI service error: Could not parse the response from the AI model.');
    } else {
      throw new Error('Failed to generate AI content. Please try again later.');
    }
  }
}

/**
 * Generate a personalized message for an event using Gemini AI
 */
export async function generateEventMessage(
  eventType: string,
  recipientName: string,
  recipientRelation: string,
  notes?: string
): Promise<string> {
  try {
    const prompt = `
      Write a warm, personalized message for a ${eventType} for ${recipientName} who is my ${recipientRelation}.
      The message should be heartfelt, specific to our relationship, and appropriate for sharing on social media.
      Keep it under 150 words and make it sound natural and personal, not generic.
      ${notes ? `Additional context about our relationship: ${notes}` : ''}
      
      Format the message nicely with appropriate emojis and line breaks.
    `;
    
    return await callGeminiAPI(prompt);
  } catch (error) {
    console.error('Error generating event message, using fallback:', error);
    
    // Provide a fallback message if the API call fails
    let fallbackMessage = '';
    
    switch (eventType) {
      case 'birthday':
        fallbackMessage = `Happy Birthday, ${recipientName}! 🎂\n\nWishing you a wonderful day filled with joy and happiness. It's been amazing having you as my ${recipientRelation}, and I hope this year brings you everything you wish for.\n\nEnjoy your special day! 🎉`;
        break;
      case 'anniversary':
        fallbackMessage = `Happy Anniversary, ${recipientName}! 💍\n\nCelebrating another year of wonderful memories with you, my amazing ${recipientRelation}. Here's to many more years of happiness together!\n\nWith love and appreciation, today and always. ❤️`;
        break;
      case 'holiday':
        fallbackMessage = `Happy Holidays, ${recipientName}! 🎄\n\nSending warm wishes to my wonderful ${recipientRelation} during this special season. May your days be merry and bright!\n\nLooking forward to creating more memories together. ✨`;
        break;
      default:
        fallbackMessage = `Thinking of you, ${recipientName}! 💫\n\nJust wanted to send a special message to my amazing ${recipientRelation}. You mean so much to me, and I'm grateful to have you in my life.\n\nHave a wonderful day! 🌟`;
    }
    
    return fallbackMessage;
  }
}

/**
 * Generate event plan suggestions using Gemini AI
 */
export async function generateEventPlan(
  eventType: string,
  recipientName: string,
  recipientRelation: string,
  notes?: string
): Promise<string> {
  try {
    const prompt = `
      Create a special plan for celebrating a ${eventType} with ${recipientName} who is my ${recipientRelation}.
      Suggest 3-5 thoughtful ideas that would make this occasion memorable and special.
      Include a mix of activities, gift ideas, and ways to make the day unique.
      ${notes ? `Additional context about our relationship: ${notes}` : ''}
      
      Format the suggestions in a clear, easy-to-read list with brief explanations for each idea.
      Include appropriate emojis and make the suggestions specific and personalized, not generic.
    `;
    
    return await callGeminiAPI(prompt);
  } catch (error) {
    console.error('Error generating event plan, using fallback:', error);
    
    // Provide a fallback plan if the API call fails
    let fallbackPlan = '';
    
    switch (eventType) {
      case 'birthday':
        fallbackPlan = `Here are some ideas to celebrate ${recipientName}'s birthday:\n\n` +
          `1. 🎁 Personalized Gift Basket - Create a custom gift basket with ${recipientName}'s favorite things. Include snacks, small gifts, and a heartfelt card.\n\n` +
          `2. 🍽️ Special Meal - Either cook their favorite meal at home or make reservations at a restaurant they've been wanting to try.\n\n` +
          `3. 🎂 Surprise Party - Organize a small gathering with close friends and family. Decorate with their favorite colors and themes.\n\n` +
          `4. 🎬 Experience Gift - Plan a special activity like a movie night, hiking trip, or spa day based on what they enjoy.\n\n` +
          `5. 📱 Video Messages - Collect video messages from friends and family who can't be there in person and compile them into one heartwarming video.`;
        break;
      case 'anniversary':
        fallbackPlan = `Here are some ideas to celebrate your anniversary with ${recipientName}:\n\n` +
          `1. 💌 Memory Lane - Create a scrapbook or digital slideshow of your favorite moments together.\n\n` +
          `2. 🍷 Recreate Your First Date - Go back to where it all began and recreate your first date together.\n\n` +
          `3. 🎁 Thoughtful Gift - Give a gift that represents your relationship or something they've been wanting.\n\n` +
          `4. 🌟 New Experience - Try something new together like a cooking class, dance lesson, or adventure activity.\n\n` +
          `5. 🌙 Romantic Getaway - Plan a weekend trip to a place you both have wanted to visit.`;
        break;
      case 'holiday':
        fallbackPlan = `Here are some ideas to celebrate the holiday with ${recipientName}:\n\n` +
          `1. 🎄 Festive Decoration - Decorate your space together with holiday-themed decorations.\n\n` +
          `2. 👨‍👩‍👧‍👦 Family Gathering - Organize a special meal with traditional holiday foods and invite close family members.\n\n` +
          `3. 🎁 Thoughtful Gift Exchange - Exchange meaningful gifts that show how well you know each other.\n\n` +
          `4. 🍪 Holiday Baking - Spend time together baking traditional holiday treats.\n\n` +
          `5. 🎭 Attend Local Events - Find holiday concerts, markets, or light displays in your area to visit together.`;
        break;
      default:
        fallbackPlan = `Here are some ideas to make this occasion special for ${recipientName}:\n\n` +
          `1. 🎁 Thoughtful Gift - Choose something that aligns with their interests or something they've mentioned wanting.\n\n` +
          `2. 📝 Heartfelt Card - Write a sincere message expressing what they mean to you.\n\n` +
          `3. 🍽️ Quality Time - Plan a special outing or meal where you can spend uninterrupted time together.\n\n` +
          `4. 📸 Create Memories - Plan an activity that will create lasting memories, like a photoshoot or special experience.\n\n` +
          `5. 🎵 Playlist or Video - Create a custom playlist of songs that remind you of them or a video montage of special moments.`;
    }
    
    return fallbackPlan;
  }
}

/**
 * Generate a response to a wellness-related query
 */
export async function generateAIResponse(query: string): Promise<string> {
  const prompt = `
    As a wellness assistant, please provide a helpful, accurate, and supportive response to the following query:
    
    "${query}"
    
    Keep your response concise, evidence-based when possible, and focused on promoting mental and physical wellbeing.
  `;
  
  return await callGeminiAPI(prompt);
}

/**
 * Generate meditation guidance based on user preferences
 */
export async function generateMeditationGuidance(
  duration: number,
  focus: string,
  experience: string
): Promise<string> {
  const prompt = `
    Create a guided meditation script for a ${duration}-minute session focused on ${focus}.
    This is for someone with ${experience} meditation experience.
    Include clear instructions for breathing, posture, and mental focus.
    Structure it with an introduction, main practice, and conclusion.
    Use calming, supportive language throughout.
  `;
  
  return await callGeminiAPI(prompt);
}