// client/src/app/meditation/downloads/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface DownloadedMeditation {
  _id: string;
  title: string;
  description: string;
  type: 'meditation' | 'sleep' | 'custom';
  duration: number;
  category?: string;
  level?: string;
  downloadedAt: string;
  lastPlayedAt?: string;
  playCount: number;
  fileSize: string;
}

// --- COMPONENT: DOWNLOADED MEDITATION CARD ---
const DownloadedMeditationCard = ({ 
  downloadedItem, 
  onPlay,
  onDelete
}: { 
  downloadedItem: DownloadedMeditation; 
  onPlay: (downloadedItem: DownloadedMeditation) => void;
  onDelete: (downloadedItem: DownloadedMeditation) => void;
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
  const getTypeIcon = (type: string) => {
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
  const getTypeColor = (type: string) => {
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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getTypeColor(downloadedItem.type)}`}>
          {getTypeIcon(downloadedItem.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-800">{downloadedItem.title}</h3>
            <span className="text-xs text-gray-500">{downloadedItem.fileSize}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>{downloadedItem.duration} min</span>
            {downloadedItem.category && (
              <>
                <span className="mx-2">•</span>
                <span className="capitalize">{downloadedItem.category}</span>
              </>
            )}
            {downloadedItem.level && (
              <>
                <span className="mx-2">•</span>
                <span className="capitalize">{downloadedItem.level}</span>
              </>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{downloadedItem.description}</p>
          
          <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
            <div>Downloaded: {formatDate(downloadedItem.downloadedAt)}</div>
            <div>Played offline: {downloadedItem.playCount} times</div>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <button 
              onClick={() => onPlay(downloadedItem)} 
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play Offline
            </button>
            
            <button
              onClick={() => onDelete(downloadedItem)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete download"
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
export default function DownloadsPage() {
  const [downloadedMeditations, setDownloadedMeditations] = useState<DownloadedMeditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedMeditation, setSelectedMeditation] = useState<DownloadedMeditation | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'meditation' | 'sleep' | 'custom'>('all');
  const [storageUsed, setStorageUsed] = useState<string>('0 MB');
  const [storageLimit, setStorageLimit] = useState<string>('100 MB');
  const [storagePercentage, setStoragePercentage] = useState<number>(0);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch downloaded meditations
  const fetchDownloadedMeditations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // In a real app, this would fetch from a local database or storage
      // For this demo, we'll simulate with an API call
      const response = await axios.get(
        'http://localhost:5001/api/meditation/downloads',
        getAuthHeaders()
      );
      
      setDownloadedMeditations(response.data.downloads);
      setStorageUsed(response.data.storageUsed);
      setStorageLimit(response.data.storageLimit);
      setStoragePercentage(response.data.storagePercentage);
    } catch (error) {
      console.error('Failed to fetch downloaded meditations:', error);
      
      // For demo purposes, set some mock data
      const mockData: DownloadedMeditation[] = [
        {
          _id: '1',
          title: 'Deep Relaxation',
          description: 'A guided meditation to help you relax deeply and release tension.',
          type: 'meditation',
          duration: 15,
          category: 'relaxation',
          level: 'beginner',
          downloadedAt: new Date().toISOString(),
          playCount: 3,
          fileSize: '12.5 MB'
        },
        {
          _id: '2',
          title: 'Rainy Night',
          description: 'Gentle rainfall sounds to help you drift off to sleep peacefully.',
          type: 'sleep',
          duration: 45,
          category: 'sleep',
          downloadedAt: new Date().toISOString(),
          playCount: 5,
          fileSize: '28.3 MB'
        },
        {
          _id: '3',
          title: 'My Custom Meditation',
          description: 'A personalized meditation with deep breathing and ocean sounds.',
          type: 'custom',
          duration: 10,
          downloadedAt: new Date().toISOString(),
          playCount: 2,
          fileSize: '8.7 MB'
        }
      ];
      
      setDownloadedMeditations(mockData);
      setStorageUsed('49.5 MB');
      setStorageLimit('100 MB');
      setStoragePercentage(49.5);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle play meditation
  const handlePlayMeditation = (downloadedItem: DownloadedMeditation) => {
    setSelectedMeditation(downloadedItem);
    setIsPlayerOpen(true);
    
    // In a real app, this would play from local storage
    // For this demo, we'll just update the play count
    setDownloadedMeditations(prevItems => 
      prevItems.map(item => 
        item._id === downloadedItem._id 
          ? { 
              ...item, 
              playCount: item.playCount + 1,
              lastPlayedAt: new Date().toISOString()
            } 
          : item
      )
    );
  };

  // Handle delete download
  const handleDeleteDownload = async (downloadedItem: DownloadedMeditation) => {
    if (confirm(`Are you sure you want to delete "${downloadedItem.title}" from your downloads? You'll need an internet connection to download it again.`)) {
      try {
        // In a real app, this would delete from local storage
        // For this demo, we'll just remove from state
        setDownloadedMeditations(prevItems => 
          prevItems.filter(item => item._id !== downloadedItem._id)
        );
        
        // Update storage usage
        const newStorageUsed = parseFloat(storageUsed) - parseFloat(downloadedItem.fileSize);
        setStorageUsed(`${newStorageUsed.toFixed(1)} MB`);
        setStoragePercentage((newStorageUsed / parseFloat(storageLimit)) * 100);
      } catch (error) {
        console.error('Failed to delete download:', error);
        alert('Failed to delete download. Please try again.');
      }
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
      
      fetchDownloadedMeditations();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchDownloadedMeditations]);

  // Filter meditations based on active filter
  const filteredMeditations = downloadedMeditations.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading downloads...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Downloads</h1>
            <Link 
              href="/meditation" 
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Meditation
            </Link>
          </div>
          
          {/* Storage Usage */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Storage Usage</h2>
              <span className="text-sm text-gray-600">{storageUsed} of {storageLimit} used</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className={`h-2.5 rounded-full ${
                  storagePercentage > 90 ? 'bg-red-600' : 
                  storagePercentage > 70 ? 'bg-yellow-600' : 
                  'bg-blue-600'
                }`} 
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Downloaded meditations are available offline. Delete downloads you no longer need to free up space.
            </p>
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
          
          {/* Downloaded Meditations List */}
          {filteredMeditations.length > 0 ? (
            <div className="space-y-4">
              {filteredMeditations.map(downloadedItem => (
                <DownloadedMeditationCard 
                  key={downloadedItem._id}
                  downloadedItem={downloadedItem}
                  onPlay={handlePlayMeditation}
                  onDelete={handleDeleteDownload}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeFilter === 'all'
                  ? "No downloads yet"
                  : `No ${activeFilter} downloads yet`}
              </h2>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeFilter === 'all'
                  ? "Download meditations, sleep content, and custom meditations to listen offline."
                  : `You haven't downloaded any ${activeFilter} content yet. Browse our collection and download for offline use.`}
              </p>
              
              {activeFilter !== 'all' && downloadedMeditations.length > 0 ? (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  View All Downloads
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
          
          {/* Offline Access Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">About Offline Access</h2>
            <div className="space-y-3 text-blue-700">
              <p className="text-sm">
                Downloaded meditations are stored on your device and can be played without an internet connection.
              </p>
              <p className="text-sm">
                Your progress for offline sessions will be synced when you reconnect to the internet.
              </p>
              <p className="text-sm">
                To save storage space, you can delete downloads you no longer need.
              </p>
            </div>
          </div>
        </div>
        
        {/* Audio Player Modal (simplified) */}
        {isPlayerOpen && selectedMeditation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  getTypeColor(selectedMeditation.type)
                }`}>
                  {selectedMeditation.type === 'meditation' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : selectedMeditation.type === 'sleep' ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMeditation.title}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="capitalize">{selectedMeditation.type}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedMeditation.duration} min</span>
                    <span className="mx-2">•</span>
                    <span className="text-green-600 font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z" clipRule="evenodd" />
                      </svg>
                      Offline
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{selectedMeditation.description}</p>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">0:00</span>
                  <span className="text-sm text-gray-500">{selectedMeditation.duration}:00</span>
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
                  onClick={() => {
                    // In a real app, this would log progress locally
                    // and sync when online
                    setIsPlayerOpen(false);
                  }}
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