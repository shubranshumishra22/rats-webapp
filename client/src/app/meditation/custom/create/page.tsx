// client/src/app/meditation/custom/create/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- COMPONENT: OPTION CARD ---
const OptionCard = ({ 
  title, 
  description, 
  isSelected, 
  onClick 
}: { 
  title: string; 
  description: string; 
  isSelected: boolean; 
  onClick: () => void; 
}) => {
  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'border-purple-500 bg-purple-50' 
          : 'border-gray-200 hover:border-purple-300'
      }`}
      onClick={onClick}
    >
      <h3 className={`font-medium ${isSelected ? 'text-purple-600' : 'text-gray-800'}`}>
        {title}
      </h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CreateCustomMeditationPage() {
  const [customMeditation, setCustomMeditation] = useState({
    name: '',
    introVoice: 'female',
    breathworkType: 'deep',
    backgroundSound: 'rain',
    duration: 5,
    isFavorite: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      await axios.post(
        'http://localhost:5001/api/meditation/custom',
        customMeditation,
        getAuthHeaders()
      );
      
      setSaveSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/meditation/custom');
      }, 1500);
    } catch (error) {
      console.error('Failed to create custom meditation:', error);
      alert('Failed to create custom meditation. Please try again.');
      setIsSaving(false);
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
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router]);

  // Intro voice options
  const introVoiceOptions = [
    { 
      id: 'female', 
      title: 'Female Voice', 
      description: 'A calming female voice to guide your meditation.' 
    },
    { 
      id: 'male', 
      title: 'Male Voice', 
      description: 'A soothing male voice to guide your meditation.' 
    },
    { 
      id: 'none', 
      title: 'No Voice', 
      description: 'No voice guidance, just ambient sounds.' 
    }
  ];

  // Breathwork options
  const breathworkOptions = [
    { 
      id: 'deep', 
      title: 'Deep Breathing', 
      description: 'Slow, deep breaths to promote relaxation and reduce stress.' 
    },
    { 
      id: 'box', 
      title: 'Box Breathing', 
      description: 'Equal inhale, hold, exhale, and hold pattern (4-4-4-4).' 
    },
    { 
      id: '4-7-8', 
      title: '4-7-8 Breathing', 
      description: 'Inhale for 4, hold for 7, exhale for 8. Great for anxiety.' 
    },
    { 
      id: 'alternate-nostril', 
      title: 'Alternate Nostril', 
      description: 'Traditional yogic breathing to balance energy.' 
    },
    { 
      id: 'none', 
      title: 'No Breathwork', 
      description: 'No specific breathing pattern guidance.' 
    }
  ];

  // Background sound options
  const backgroundSoundOptions = [
    { id: 'rain', title: 'Gentle Rain', description: 'Soft rainfall sounds.' },
    { id: 'ocean', title: 'Ocean Waves', description: 'Calming ocean waves.' },
    { id: 'forest', title: 'Forest Sounds', description: 'Peaceful forest ambience.' },
    { id: 'stream', title: 'Flowing Stream', description: 'Gentle flowing water.' },
    { id: 'white-noise', title: 'White Noise', description: 'Consistent white noise.' },
    { id: 'birds', title: 'Bird Songs', description: 'Peaceful bird songs.' },
    { id: 'piano', title: 'Soft Piano', description: 'Gentle piano melodies.' },
    { id: 'none', title: 'Silence', description: 'No background sounds.' }
  ];

  // Duration options
  const durationOptions = [
    { id: 3, title: '3 Minutes', description: 'A quick mindfulness break.' },
    { id: 5, title: '5 Minutes', description: 'Short but effective session.' },
    { id: 10, title: '10 Minutes', description: 'Standard meditation length.' },
    { id: 15, title: '15 Minutes', description: 'Deeper meditation experience.' },
    { id: 20, title: '20 Minutes', description: 'Extended meditation session.' },
    { id: 30, title: '30 Minutes', description: 'Comprehensive meditation practice.' }
  ];

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Name Your Meditation</h2>
            <input
              type="text"
              value={customMeditation.name}
              onChange={(e) => setCustomMeditation({ ...customMeditation, name: e.target.value })}
              placeholder="Enter a name for your meditation"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        );
      
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Voice Guidance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {introVoiceOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  isSelected={customMeditation.introVoice === option.id}
                  onClick={() => setCustomMeditation({ 
                    ...customMeditation, 
                    introVoice: option.id 
                  })}
                />
              ))}
            </div>
          </div>
        );
      
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Breathwork Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {breathworkOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  isSelected={customMeditation.breathworkType === option.id}
                  onClick={() => setCustomMeditation({ 
                    ...customMeditation, 
                    breathworkType: option.id 
                  })}
                />
              ))}
            </div>
          </div>
        );
      
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Choose Background Sound</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {backgroundSoundOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  isSelected={customMeditation.backgroundSound === option.id}
                  onClick={() => setCustomMeditation({ 
                    ...customMeditation, 
                    backgroundSound: option.id 
                  })}
                />
              ))}
            </div>
          </div>
        );
      
      case 5:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Set Duration</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {durationOptions.map((option) => (
                <OptionCard
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  isSelected={customMeditation.duration === option.id}
                  onClick={() => setCustomMeditation({ 
                    ...customMeditation, 
                    duration: option.id 
                  })}
                />
              ))}
            </div>
          </div>
        );
      
      case 6:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Your Meditation</h2>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4">{customMeditation.name || 'Untitled Meditation'}</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Voice Guidance:</span>
                  <span className="font-medium">
                    {introVoiceOptions.find(o => o.id === customMeditation.introVoice)?.title}
                  </span>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Breathwork:</span>
                  <span className="font-medium">
                    {breathworkOptions.find(o => o.id === customMeditation.breathworkType)?.title}
                  </span>
                </div>
                
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Background Sound:</span>
                  <span className="font-medium">
                    {backgroundSoundOptions.find(o => o.id === customMeditation.backgroundSound)?.title}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{customMeditation.duration} minutes</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Navigation buttons
  const renderNavButtons = () => {
    return (
      <div className="flex justify-between mt-8">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        
        {currentStep < 6 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 1 && !customMeditation.name}
            className={`px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-auto ${
              currentStep === 1 && !customMeditation.name ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSaving || !customMeditation.name}
            className={`px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto ${
              (isSaving || !customMeditation.name) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Creating...' : 'Create Meditation'}
          </button>
        )}
      </div>
    );
  };

  // Progress bar
  const renderProgressBar = () => {
    const progress = (currentStep / 6) * 100;
    
    return (
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of 6</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Create Custom Meditation</h1>
            <Link 
              href="/meditation/custom" 
              className="text-purple-600 hover:underline text-sm font-medium"
            >
              Cancel
            </Link>
          </div>
          
          {saveSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Meditation created successfully! Redirecting...</span>
            </div>
          )}
          
          {renderProgressBar()}
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {renderStepContent()}
            {renderNavButtons()}
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}