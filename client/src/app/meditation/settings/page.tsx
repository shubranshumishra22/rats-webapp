// client/src/app/meditation/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface MeditationPreferences {
  reminderEnabled: boolean;
  reminderTime: string;
  preferredDuration: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  preferredCategories: string[];
  notificationsEnabled: boolean;
}

// --- COMPONENT: TOGGLE SWITCH ---
const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  label 
}: { 
  enabled: boolean; 
  onChange: (enabled: boolean) => void; 
  label: string; 
}) => {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full ${
          enabled ? 'bg-purple-600' : 'bg-gray-200'
        }`}
        onClick={() => onChange(!enabled)}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

// --- COMPONENT: CATEGORY CHECKBOX ---
const CategoryCheckbox = ({ 
  category, 
  isSelected, 
  onChange 
}: { 
  category: string; 
  isSelected: boolean; 
  onChange: (category: string, selected: boolean) => void; 
}) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onChange(category, e.target.checked)}
        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
      />
      <span className="text-gray-700 capitalize">{category}</span>
    </label>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function MeditationSettingsPage() {
  const [preferences, setPreferences] = useState<MeditationPreferences>({
    reminderEnabled: false,
    reminderTime: '08:00',
    preferredDuration: 10,
    preferredTime: 'morning',
    preferredCategories: [],
    notificationsEnabled: true
  });
  
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'focus', 'calm', 'sleep', 'anxiety', 'stress', 'mindfulness'
  ]);
  
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
      
      const response = await axios.get(
        'http://localhost:5001/api/meditation/preferences',
        getAuthHeaders()
      );
      
      if (response.data) {
        setPreferences(response.data);
      }
      
      // Fetch available categories
      const categoriesResponse = await axios.get(
        'http://localhost:5001/api/meditation/categories',
        getAuthHeaders()
      );
      
      if (categoriesResponse.data && categoriesResponse.data.length > 0) {
        setAvailableCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      await axios.put(
        'http://localhost:5001/api/meditation/preferences',
        preferences,
        getAuthHeaders()
      );
      
      setSaveSuccess(true);
      
      // Reset success message after a delay
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

  // Handle category selection
  const handleCategoryChange = (category: string, selected: boolean) => {
    if (selected) {
      setPreferences({
        ...preferences,
        preferredCategories: [...preferences.preferredCategories, category]
      });
    } else {
      setPreferences({
        ...preferences,
        preferredCategories: preferences.preferredCategories.filter(c => c !== category)
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

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading preferences...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Meditation Settings</h1>
            <Link 
              href="/meditation" 
              className="text-purple-600 hover:underline text-sm font-medium"
            >
              Back to Meditation
            </Link>
          </div>
          
          {saveSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Settings saved successfully!</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Reminders Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Reminders</h2>
                
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={preferences.reminderEnabled}
                    onChange={(enabled) => setPreferences({ ...preferences, reminderEnabled: enabled })}
                    label="Daily Meditation Reminder"
                  />
                  
                  {preferences.reminderEnabled && (
                    <div className="ml-6 mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        value={preferences.reminderTime}
                        onChange={(e) => setPreferences({ ...preferences, reminderTime: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  )}
                  
                  <ToggleSwitch
                    enabled={preferences.notificationsEnabled}
                    onChange={(enabled) => setPreferences({ ...preferences, notificationsEnabled: enabled })}
                    label="Push Notifications"
                  />
                </div>
              </div>
              
              {/* Preferences Section */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Meditation Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Duration
                    </label>
                    <select
                      value={preferences.preferredDuration}
                      onChange={(e) => setPreferences({ ...preferences, preferredDuration: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value={3}>3 minutes</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={20}>20 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time of Day
                    </label>
                    <select
                      value={preferences.preferredTime}
                      onChange={(e) => setPreferences({ 
                        ...preferences, 
                        preferredTime: e.target.value as 'morning' | 'afternoon' | 'evening' | 'night' 
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Categories Section */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Preferred Categories</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Select categories that interest you to receive personalized recommendations.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {availableCategories.map(category => (
                    <CategoryCheckbox
                      key={category}
                      category={category}
                      isSelected={preferences.preferredCategories.includes(category)}
                      onChange={handleCategoryChange}
                    />
                  ))}
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="p-6 bg-gray-50 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </form>
          
          {/* Data Management */}
          <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Data Management</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">Reset Progress</h3>
                    <p className="text-sm text-gray-600">
                      Clear all your meditation progress and stats.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all your meditation progress? This action cannot be undone.')) {
                        // Reset progress API call would go here
                        alert('This feature is not yet implemented.');
                      }
                    }}
                  >
                    Reset
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">Download Data</h3>
                    <p className="text-sm text-gray-600">
                      Export all your meditation data and progress.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      // Download data API call would go here
                      alert('This feature is not yet implemented.');
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}