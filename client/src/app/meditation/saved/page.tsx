// client/src/app/meditation/saved/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface SavedMeditation {
  _id: string;
  meditation: {
    _id: string;
    title: string;
    description: string;
    audioUrl: string;
    imageUrl?: string;
    duration: number;
    category: string;
    level?: string;
    type?: 'meditation' | 'sleep' | 'custom';
  };
  savedAt: string;
  lastPlayedAt?: string;
  playCount: number;
}

// --- COMPONENT: SAVED MEDITATION CARD ---
const SavedMeditationCard = ({ 
  savedItem, 
  onPlay,
  onRemove
}: { 
  savedItem: SavedMeditation; 
  onPlay: (savedItem: SavedMeditation) => void;
  onRemove: (savedItem: SavedMeditation) => void;
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get type icon
  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'meditation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'sleep':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'custom':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // Get type color
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'meditation':
        return 'bg-blue-100 text-blue-600';
      case 'sleep':
        return 'bg-indigo-100 text-indigo-600';
      case 'custom':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-40">
        <img 
          src={savedItem.meditation.imageUrl || '/images/meditation-default.jpg'} 
          alt={savedItem.meditation.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent flex flex-col justify-end p-4">
          <div className="flex items-center mb-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
              getTypeColor(savedItem.meditation.type)
            }`}>
              {savedItem.meditation.type?.charAt(0).toUpperCase() + (savedItem.meditation.type?.slice(1) || 'Meditation')}
            </span>
            {savedItem.meditation.level && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize">
                {savedItem.meditation.level}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white">{savedItem.meditation.title}</h2>
          <div className="flex items-center text-white/80 text-xs mt-1">
            <span>{savedItem.meditation.duration} min</span>
            {savedItem.meditation.category && (
              <>
                <span className="mx-2">•</span>
                <span className="capitalize">{savedItem.meditation.category}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
          <div>Saved: {formatDate(savedItem.savedAt)}</div>
          <div>Played: {savedItem.playCount} times</div>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{savedItem.meditation.description}</p>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onPlay(savedItem)} 
            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Play
          </button>
          
          <button
            onClick={() => onRemove(savedItem)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function SavedMeditationsPage() {
  const [savedMeditations, setSavedMeditations] = useState<SavedMeditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState<SavedMeditation | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'meditation' | 'sleep' | 'custom'>('all');
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch saved meditations
  const fetchSavedMeditations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(
        'http://localhost:5001/api/meditation/saved',
        getAuthHeaders()
      );
      
      setSavedMeditations(response.data);
    } catch (error) {
      console.error('Failed to fetch saved meditations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle play meditation
  const handlePlayMeditation = (savedItem: SavedMeditation) => {
    setSelectedMeditation(savedItem);
    setIsPlayerOpen(true);
  };

  // Handle remove from saved
  const handleRemoveFromSaved = async (savedItem: SavedMeditation) => {
    if (confirm(`Are you sure you want to remove "${savedItem.meditation.title}" from your saved meditations?`)) {
      try {
        await axios.delete(
          `http://localhost:5001/api/meditation/saved/${savedItem._id}`,
          getAuthHeaders()
        );
        
        // Remove from state
        setSavedMeditations(prevItems => 
          prevItems.filter(item => item._id !== savedItem._id)
        );
      } catch (error) {
        console.error('Failed to remove from saved:', error);
        alert('Failed to remove meditation. Please try again.');
      }
    }
  };

  // Log meditation progress
  const logProgress = async () => {
    if (!selectedMeditation) return;
    
    try {
      await axios.post(
        'http://localhost:5001/api/meditation/progress',
        {
          meditationId: selectedMeditation.meditation._id,
          contentType: selectedMeditation.meditation.type || 'Meditation',
          duration: selectedMeditation.meditation.duration,
          mood: 'calm', // Default mood
        },
        getAuthHeaders()
      );
      
      // Update play count in state
      setSavedMeditations(prevItems => 
        prevItems.map(item => 
          item._id === selectedMeditation._id 
            ? { 
                ...item, 
                playCount: item.playCount + 1,
                lastPlayedAt: new Date().toISOString()
              } 
            : item
        )
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
      
      fetchSavedMeditations();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchSavedMeditations]);

  // Filter meditations based on active filter
  const filteredMeditations = savedMeditations.filter(item => {
    if (activeFilter === 'all') return true;
    return item.meditation.type === activeFilter;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading saved meditations...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Saved Meditations</h1>
            <Link 
              href="/meditation" 
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Meditation
            </Link>
          </div>
          
          {/* Filters */}
          <div className="flex items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('meditation')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'meditation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Meditations
              </button>
              <button
                onClick={() => setActiveFilter('sleep')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'sleep'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Sleep
              </button>
              <button
                onClick={() => setActiveFilter('custom')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'custom'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          
          {/* Saved Meditations Grid */}
          {filteredMeditations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeditations.map(savedItem => (
                <SavedMeditationCard 
                  key={savedItem._id}
                  savedItem={savedItem}
                  onPlay={handlePlayMeditation}
                  onRemove={handleRemoveFromSaved}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeFilter === 'all'
                  ? "No saved meditations yet"
                  : `No saved ${activeFilter} content yet`}
              </h2>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeFilter === 'all'
                  ? "Save your favorite meditations, sleep content, and custom meditations to access them quickly here."
                  : `You haven't saved any ${activeFilter} content yet. Browse our collection and save your favorites.`}
              </p>
              
              {activeFilter !== 'all' && savedMeditations.length > 0 ? (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  View All Saved Items
                </button>
              ) : (
                <Link
                  href="/meditation"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Meditations
                </Link>
              )}
            </div>
          )}
          
          {/* How to Save Section */}
          {savedMeditations.length === 0 && (
            <div className="mt-10 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">How to Save Meditations</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-2">Find Content</h3>
                    <p className="text-sm text-gray-600">
                      Browse through our collection of meditations, sleep content, and courses.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-2">Save Favorites</h3>
                    <p className="text-sm text-gray-600">
                      Click the bookmark icon on any meditation or content you want to save.
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-2">Quick Access</h3>
                    <p className="text-sm text-gray-600">
                      Return to this page anytime to access your saved content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Audio Player Modal (simplified) */}
        {isPlayerOpen && selectedMeditation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-2">{selectedMeditation.meditation.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedMeditation.meditation.description}</p>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">0:00</span>
                  <span className="text-sm text-gray-500">{selectedMeditation.meditation.duration}:00</span>
                </div>
                <div className="h-2 bg-gray-300 rounded-full">
                  <div className="h-full w-0 bg-blue-600 rounded-full"></div>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <button className="p-2 rounded-full bg-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full bg-blue-600 text-white">
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
                  onClick={logProgress}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Complete Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}