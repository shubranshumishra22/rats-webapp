// client/src/app/meditation/preferences/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface MeditationPreferences {
  goals?: string[];
  preferredDuration?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  reminders?: boolean;
  reminderTime?: string;
}

// --- MAIN PAGE COMPONENT ---
export default function MeditationPreferencesPage() {
  const [preferences, setPreferences] = useState<MeditationPreferences>({
    goals: [],
    preferredDuration: 5,
    experienceLevel: 'beginner',
    preferredTime: 'morning',
    reminders: false,
    reminderTime: '08:00'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch user preferences
  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Get user profile which includes meditation preferences
      const response = await axios.get(
        'http://localhost:5001/api/users/profile/me',
        getAuthHeaders()
      );
      
      if (response.data.meditationPreferences) {
        setPreferences(response.data.meditationPreferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Save preferences
  const savePreferences = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      
      await axios.put(
        'http://localhost:5001/api/meditation/preferences',
        preferences,
        getAuthHeaders()
      );
      
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle goal selection
  const handleGoalToggle = (goal: string) => {
    const currentGoals = preferences.goals || [];
    
    if (currentGoals.includes(goal)) {
      setPreferences({
        ...preferences,
        goals: currentGoals.filter(g => g !== goal)
      });
    } else {
      setPreferences({
        ...preferences,
        goals: [...currentGoals, goal]
      });
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      const expiry = decodedToken.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiry) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('rats_token');
        router.push('/login');
        return;
      }
      
      fetchPreferences();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchPreferences]);

  // Goal options
  const goalOptions = [
    { id: 'stress-relief', label: 'Stress Relief' },
    { id: 'better-sleep', label: 'Better Sleep' },
    { id: 'focus', label: 'Improve Focus' },
    { id: 'anxiety', label: 'Manage Anxiety' },
    { id: 'happiness', label: 'Increase Happiness' },
    { id: 'self-love', label: 'Self Love' },
    { id: 'productivity', label: 'Productivity' },
    { id: 'mindfulness', label: 'Mindfulness' }
  ];

  // Duration options
  const durationOptions = [
    { value: 3, label: '3 minutes' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' }
  ];

  // Experience level options
  const experienceLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  // Preferred time options
  const preferredTimeOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'evening', label: 'Evening' },
    { value: 'night', label: 'Night' }
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading preferences...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Meditation Preferences</h1>
          
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Meditation Goals</h2>
            <p className="text-gray-600 mb-4">
              Select the goals you want to achieve with meditation. This helps us recommend the right sessions for you.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {goalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalToggle(goal.id)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    preferences.goals?.includes(goal.id)
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  {goal.label}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Preferred Session Duration
                </label>
                <select
                  value={preferences.preferredDuration}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredDuration: parseInt(e.target.value)
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {durationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Experience Level
                </label>
                <select
                  value={preferences.experienceLevel}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    experienceLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {experienceLevelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Preferred Meditation Time
                </label>
                <select
                  value={preferences.preferredTime}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    preferredTime: e.target.value as 'morning' | 'afternoon' | 'evening' | 'night'
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {preferredTimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Reminders</h2>
            <p className="text-gray-600 mb-4">
              Set up reminders to help you maintain a consistent meditation practice.
            </p>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="enableReminders"
                checked={preferences.reminders}
                onChange={(e) => setPreferences({
                  ...preferences,
                  reminders: e.target.checked
                })}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="enableReminders" className="ml-2 text-gray-700">
                Enable daily meditation reminders
              </label>
            </div>
            
            {preferences.reminders && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    reminderTime: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/meditation')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            
            <div className="flex items-center">
              {saveSuccess && (
                <span className="text-green-600 mr-4">
                  Preferences saved successfully!
                </span>
              )}
              
              <button
                onClick={savePreferences}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}