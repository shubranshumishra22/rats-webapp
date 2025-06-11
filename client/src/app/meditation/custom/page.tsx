// client/src/app/meditation/custom/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface CustomMeditation {
  _id: string;
  name: string;
  introVoice: 'male' | 'female' | 'none';
  breathworkType: 'box' | '4-7-8' | 'deep' | 'alternate-nostril' | 'none';
  backgroundSound: string;
  duration: number;
  isFavorite: boolean;
  createdAt: string;
}

// --- COMPONENT: CUSTOM MEDITATION CARD ---
const CustomMeditationCard = ({ 
  meditation, 
  onPlay, 
  onEdit, 
  onDelete, 
  onToggleFavorite 
}: { 
  meditation: CustomMeditation; 
  onPlay: (meditation: CustomMeditation) => void; 
  onEdit: (meditation: CustomMeditation) => void; 
  onDelete: (meditation: CustomMeditation) => void; 
  onToggleFavorite: (meditation: CustomMeditation) => void; 
}) => {
  // Helper function to get background image based on sound
  const getBackgroundImage = (sound: string) => {
    switch (sound) {
      case 'rain':
        return '/images/sounds/rain.jpg';
      case 'ocean':
        return '/images/sounds/ocean.jpg';
      case 'forest':
        return '/images/sounds/forest.jpg';
      case 'stream':
        return '/images/sounds/stream.jpg';
      case 'birds':
        return '/images/sounds/birds.jpg';
      default:
        return '/images/custom-meditation.jpg';
    }
  };
  
  // Helper function to get breathwork description
  const getBreathworkDescription = (type: string) => {
    switch (type) {
      case 'box':
        return 'Box Breathing';
      case '4-7-8':
        return '4-7-8 Technique';
      case 'deep':
        return 'Deep Breathing';
      case 'alternate-nostril':
        return 'Alternate Nostril';
      case 'none':
        return 'No Breathwork';
      default:
        return type;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-40">
        <img 
          src={getBackgroundImage(meditation.backgroundSound)} 
          alt={meditation.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent flex items-end p-4">
          <div className="flex-1">
            <h3 className="text-white font-semibold">{meditation.name}</h3>
            <div className="flex items-center mt-1 text-xs text-white/80">
              <span>{meditation.duration} min</span>
              <span className="mx-2">•</span>
              <span>{getBreathworkDescription(meditation.breathworkType)}</span>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(meditation);
            }}
            className="text-white hover:text-yellow-300"
          >
            <svg 
              className={`w-6 h-6 ${meditation.isFavorite ? 'text-yellow-300 fill-yellow-300' : 'fill-none'}`} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-3.536 3.536m-10.607 0l3.536-3.536" />
            </svg>
            <span>{meditation.backgroundSound.charAt(0).toUpperCase() + meditation.backgroundSound.slice(1)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>{meditation.introVoice.charAt(0).toUpperCase() + meditation.introVoice.slice(1)} Voice</span>
          </div>
        </div>
        <div className="flex justify-between mt-4">
          <button 
            onClick={() => onPlay(meditation)} 
            className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
          >
            Play
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => onEdit(meditation)} 
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="Edit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button 
              onClick={() => onDelete(meditation)} 
              className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CustomMeditationsPage() {
  const [customMeditations, setCustomMeditations] = useState<CustomMeditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMeditation, setSelectedMeditation] = useState<CustomMeditation | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [meditationToDelete, setMeditationToDelete] = useState<CustomMeditation | null>(null);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch custom meditations
  const fetchCustomMeditations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(
        'http://localhost:5001/api/meditation/custom',
        getAuthHeaders()
      );
      
      setCustomMeditations(response.data);
    } catch (error) {
      console.error('Failed to fetch custom meditations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle play meditation
  const handlePlayMeditation = (meditation: CustomMeditation) => {
    setSelectedMeditation(meditation);
    setIsPlayerOpen(true);
  };

  // Handle edit meditation
  const handleEditMeditation = (meditation: CustomMeditation) => {
    router.push(`/meditation/custom/edit/${meditation._id}`);
  };

  // Handle delete meditation
  const handleDeleteMeditation = (meditation: CustomMeditation) => {
    setMeditationToDelete(meditation);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete meditation
  const confirmDeleteMeditation = async () => {
    if (!meditationToDelete) return;
    
    try {
      await axios.delete(
        `http://localhost:5001/api/meditation/custom/${meditationToDelete._id}`,
        getAuthHeaders()
      );
      
      // Update custom meditations list
      setCustomMeditations(customMeditations.filter(m => m._id !== meditationToDelete._id));
      
      // Close modal
      setIsDeleteModalOpen(false);
      setMeditationToDelete(null);
    } catch (error) {
      console.error('Failed to delete custom meditation:', error);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (meditation: CustomMeditation) => {
    try {
      await axios.put(
        `http://localhost:5001/api/meditation/custom/${meditation._id}`,
        { isFavorite: !meditation.isFavorite },
        getAuthHeaders()
      );
      
      // Update custom meditations list
      setCustomMeditations(customMeditations.map(m => 
        m._id === meditation._id ? { ...m, isFavorite: !m.isFavorite } : m
      ));
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  };

  // Log meditation progress
  const logProgress = async (meditation: CustomMeditation) => {
    try {
      await axios.post(
        'http://localhost:5001/api/meditation/progress',
        {
          meditationId: meditation._id,
          contentType: 'CustomMeditation',
          duration: meditation.duration,
          mood: 'calm', // Default mood
        },
        getAuthHeaders()
      );
      
      // Close player
      setIsPlayerOpen(false);
      setSelectedMeditation(null);
    } catch (error) {
      console.error('Failed to log progress:', error);
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
      
      fetchCustomMeditations();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchCustomMeditations]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading custom meditations...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Custom Meditations</h1>
            <div className="flex space-x-4">
              <Link 
                href="/meditation" 
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Back to Meditation
              </Link>
              <Link 
                href="/meditation/custom/create" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Create New
              </Link>
            </div>
          </div>
          
          {/* Content Grid */}
          {customMeditations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {customMeditations.map(meditation => (
                <CustomMeditationCard 
                  key={meditation._id}
                  meditation={meditation}
                  onPlay={handlePlayMeditation}
                  onEdit={handleEditMeditation}
                  onDelete={handleDeleteMeditation}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">No Custom Meditations</h2>
              <p className="text-gray-600 mb-4">You haven't created any custom meditations yet.</p>
              <Link 
                href="/meditation/custom/create" 
                className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Your First Meditation
              </Link>
            </div>
          )}
        </div>
        
        {/* Audio Player Modal (simplified) */}
        {isPlayerOpen && selectedMeditation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">{selectedMeditation.name}</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 0l-3.536 3.536m-10.607 0l3.536-3.536" />
                    </svg>
                    <span>{selectedMeditation.backgroundSound}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span>{selectedMeditation.breathworkType}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">0:00</span>
                  <span className="text-sm text-gray-500">{selectedMeditation.duration}:00</span>
                </div>
                <div className="h-2 bg-gray-300 rounded-full">
                  <div className="h-full w-0 bg-purple-600 rounded-full"></div>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <button className="p-2 rounded-full bg-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full bg-purple-600 text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button className="p-2 rounded-full bg-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <button 
                  onClick={() => setIsPlayerOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button 
                  onClick={() => logProgress(selectedMeditation)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Complete Session
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && meditationToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-2">Delete Custom Meditation</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{meditationToDelete.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setMeditationToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteMeditation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}