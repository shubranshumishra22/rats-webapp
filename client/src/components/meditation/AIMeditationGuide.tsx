'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import aiService, { AIResponse } from '@/services/aiService';

interface AIMeditationGuideProps {
  userMood: string;
  meditationHistory: {
    totalSessions: number;
    totalMinutes: number;
    recentCategories: string[];
    preferredDuration: number;
  };
  userGoals: string[];
  onSuggestionSelect: (suggestion: string) => void;
}

const AIMeditationGuide: React.FC<AIMeditationGuideProps> = ({
  userMood,
  meditationHistory,
  userGoals,
  onSuggestionSelect
}) => {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIGuidance = async () => {
      setIsLoading(true);
      try {
        const timeOfDay = getTimeOfDay();
        const response = await aiService.getMeditationGuidance({
          prompt: "Suggest a meditation practice for me right now",
          context: {
            userMood,
            meditationHistory,
            timeOfDay,
            userGoals
          }
        });
        setAiResponse(response);
      } catch (error) {
        console.error('Error fetching AI guidance:', error);
        // Set fallback response
        setAiResponse({
          text: "Take a moment to center yourself and focus on your breath. Notice how your body feels right now.",
          suggestions: ["Mindful breathing", "Body scan", "Loving-kindness meditation"],
          mood: userMood,
          meditationTips: ["Find a quiet space", "Start with just a few minutes", "Be kind to yourself"],
          customPrompt: "Take three deep breaths and notice how your body feels right now."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIGuidance();
  }, [userMood, meditationHistory, userGoals]);

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setTimeout(() => {
      onSuggestionSelect(suggestion);
      setSelectedSuggestion(null);
    }, 500);
  };

  const getMoodEmoji = (mood: string): string => {
    const moodMap: {[key: string]: string} = {
      'calm': '😌',
      'anxious': '😰',
      'stressed': '😓',
      'tired': '😴',
      'energetic': '⚡',
      'focused': '🧠',
      'sleepy': '💤',
      'restless': '🌀',
      'neutral': '😊'
    };
    
    return moodMap[mood.toLowerCase()] || '😊';
  };

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '0.75rem', 
        padding: '1.5rem', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '12rem' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '2.5rem', 
            height: '2.5rem', 
            border: '4px solid #3b82f6', 
            borderTopColor: 'transparent', 
            borderRadius: '9999px', 
            animation: 'spin 1s linear infinite', 
            marginBottom: '0.5rem' 
          }}></div>
          <p style={{ color: '#4b5563' }}>Getting personalized guidance...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
      <div style={{ 
        background: 'linear-gradient(to right, #3b82f6, #4f46e5)', 
        padding: '1rem', 
        color: '#ffffff' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '2.5rem', 
            height: '2.5rem', 
            borderRadius: '9999px', 
            backgroundColor: 'rgba(255, 255, 255, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: '0.75rem' 
          }}>
            <span style={{ fontSize: '1.25rem' }}>{getMoodEmoji(aiResponse?.mood || userMood)}</span>
          </div>
          <div>
            <h3 style={{ fontWeight: '500' }}>Your Meditation Assistant</h3>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>Based on your current mood: {aiResponse?.mood || userMood}</p>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '1.25rem' }}>
        <p style={{ color: '#374151', marginBottom: '1rem' }}>{aiResponse?.text}</p>
        
        <h4 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>Suggested Practices:</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: '0.5rem', 
          marginBottom: '1rem'
        }}>
          {aiResponse?.suggestions?.map((suggestion, index) => (
            <motion.button
              key={index}
              style={{ 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem', 
                fontWeight: '500',
                backgroundColor: selectedSuggestion === suggestion ? '#2563eb' : '#eff6ff',
                color: selectedSuggestion === suggestion ? '#ffffff' : '#1d4ed8'
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
        
        <div style={{ 
          backgroundColor: '#eef2ff', 
          borderRadius: '0.5rem', 
          padding: '1rem', 
          marginTop: '1rem' 
        }}>
          <h4 style={{ fontWeight: '500', color: '#3730a3', marginBottom: '0.5rem' }}>Try this prompt:</h4>
          <p style={{ color: '#4338ca', fontStyle: 'italic' }}>"{aiResponse?.customPrompt}"</p>
        </div>
        
        {aiResponse?.meditationTips && aiResponse.meditationTips.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.5rem' }}>Quick Tips:</h4>
            <ul style={{ 
              listStyleType: 'disc', 
              listStylePosition: 'inside', 
              fontSize: '0.875rem', 
              color: '#4b5563' 
            }}>
              {aiResponse.meditationTips.map((tip, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMeditationGuide;