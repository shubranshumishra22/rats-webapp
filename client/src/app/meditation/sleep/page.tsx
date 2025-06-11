// client/src/app/meditation/sleep/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface SleepContent {
  _id: string;
  title: string;
  description: string;
  type: 'story' | 'soundscape';
  audioUrl: string;
  imageUrl?: string;
  duration: number;
  category: string;
  isPremium: boolean;
  isDownloadable: boolean;
}

// --- COMPONENT: SLEEP CONTENT CARD ---
const SleepContentCard = ({ 
  content, 
  onPlay, 
  onSave, 
  onDownload,
  isSaved = false,
  isDownloaded = false
}: { 
  content: SleepContent; 
  onPlay: (content: SleepContent) => void; 
  onSave: (content: SleepContent) => void; 
  onDownload: (content: SleepContent) => void;
  isSaved?: boolean;
  isDownloaded?: boolean;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-40">
        <img 
          src={content.imageUrl || '/images/sleep-default.jpg'} 
          alt={content.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent flex items-end p-4">
          <div>
            <h3 className="text-white font-semibold">{content.title}</h3>
            <div className="flex items-center mt-1 text-xs text-white/80">
              <span>{content.duration} min</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{content.type}</span>
              {content.isPremium && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-yellow-300 font-semibold">Premium</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2">{content.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <button 
            onClick={() => onPlay(content)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Play
          </button>
          <div className="flex space-x-2">
            <button 
              onClick={() => onSave(content)} 
              className="text-gray-500 hover:text-indigo-600"
              title={isSaved ? "Remove from saved" : "Save for later"}
            >
              <svg 
                className={`w-6 h-6 ${isSaved ? 'fill-indigo-600 text-indigo-600' : 'fill-none text-gray-500'}`} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
            
            {content.isDownloadable && (
              <button 
                onClick={() => onDownload(content)} 
                className={`text-gray-500 hover:text-indigo-600 ${isDownloaded ? 'text-indigo-600' : ''}`}
                title={isDownloaded ? "Downloaded" : "Download for offline use"}
                disabled={isDownloaded}
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d={isDownloaded 
                      ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      : "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    }
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function SleepContentPage() {
  const [sleepContent, setSleepContent] = useState<SleepContent[]>([]);
  const [filteredContent, setFilteredContent] = useState<SleepContent[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [savedContent, setSavedContent] = useState<string[]>([]);
  const [downloadedContent, setDownloadedContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<SleepContent | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch sleep content
  const fetchSleepContent = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch all sleep content
      const response = await axios.get(
        'http://localhost:5001/api/meditation/sleep',
        getAuthHeaders()
      );
      
      setSleepContent(response.data);
      setFilteredContent(response.data);
      
      // Fetch saved content
      const savedResponse = await axios.get(
        'http://localhost:5001/api/meditation/saved',
        getAuthHeaders()
      );
      
      setSavedContent(savedResponse.data.map((item: any) => item._id));
      
      // Fetch downloaded content
      const downloadedResponse = await axios.get(
        'http://localhost:5001/api/meditation/downloads',
        getAuthHeaders()
      );
      
      setDownloadedContent(downloadedResponse.data.map((item: any) => item._id));
    } catch (error) {
      console.error('Failed to fetch sleep content:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Filter content
  const filterContent = useCallback(() => {
    let filtered = [...sleepContent];
    
    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(content => content.type === selectedType);
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(content => content.category === selectedCategory);
    }
    
    setFilteredContent(filtered);
  }, [sleepContent, selectedType, selectedCategory]);

  // Handle type selection
  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle play content
  const handlePlayContent = (content: SleepContent) => {
    setSelectedContent(content);
    setIsPlayerOpen(true);
  };

  // Handle save content
  const handleSaveContent = async (content: SleepContent) => {
    try {
      await axios.post(
        `http://localhost:5001/api/meditation/${content._id}/save`,
        { contentType: 'SleepContent' },
        getAuthHeaders()
      );
      
      // Update saved content list
      if (savedContent.includes(content._id)) {
        setSavedContent(savedContent.filter(id => id !== content._id));
      } else {
        setSavedContent([...savedContent, content._id]);
      }
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  // Handle download content
  const handleDownloadContent = async (content: SleepContent) => {
    try {
      // Only allow download if not already downloaded
      if (!downloadedContent.includes(content._id)) {
        await axios.post(
          `http://localhost:5001/api/meditation/${content._id}/download`,
          { contentType: 'SleepContent' },
          getAuthHeaders()
        );
        
        // Update downloaded content list
        setDownloadedContent([...downloadedContent, content._id]);
        
        // Show success message (in a real app, this would trigger the actual download)
        alert(`${content.title} has been downloaded for offline use.`);
      }
    } catch (error) {
      console.error('Failed to download content:', error);
    }
  };

  // Log sleep content progress
  const logProgress = async (content: SleepContent) => {
    try {
      await axios.post(
        'http://localhost:5001/api/meditation/progress',
        {
          meditationId: content._id,
          contentType: 'SleepContent',
          duration: content.duration,
          mood: 'calm', // Default mood
        },
        getAuthHeaders()
      );
      
      // Close player
      setIsPlayerOpen(false);
      setSelectedContent(null);
    } catch (error) {
      console.error('Failed to log progress:', error);
    }
  };

  // Apply filters when selection changes
  useEffect(() => {
    filterContent();
  }, [selectedType, selectedCategory, filterContent]);

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
      
      fetchSleepContent();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchSleepContent]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading sleep content...</div>;
  }

  // Get unique categories from sleep content
  const categories = ['all', ...new Set(sleepContent.map(content => content.category))];

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Sleep & Relaxation</h1>
            <Link 
              href="/meditation" 
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Meditation
            </Link>
          </div>
          
          {/* Filter Controls */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Content Type</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTypeSelect('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'all'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => handleTypeSelect('story')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'story'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Sleep Stories
                  </button>
                  <button
                    onClick={() => handleTypeSelect('soundscape')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedType === 'soundscape'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Soundscapes
                  </button>
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Grid */}
          {filteredContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map(content => (
                <SleepContentCard 
                  key={content._id}
                  content={content}
                  onPlay={handlePlayContent}
                  onSave={handleSaveContent}
                  onDownload={handleDownloadContent}
                  isSaved={savedContent.includes(content._id)}
                  isDownloaded={downloadedContent.includes(content._id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No content found for the selected filters. Please try different options.
              </p>
            </div>
          )}
        </div>
        
        {/* Audio Player Modal (simplified) */}
        {isPlayerOpen && selectedContent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">{selectedContent.title}</h3>
              <p className="text-gray-600 mb-4">{selectedContent.description}</p>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">0:00</span>
                  <span className="text-sm text-gray-500">{selectedContent.duration}:00</span>
                </div>
                <div className="h-2 bg-gray-300 rounded-full">
                  <div className="h-full w-0 bg-indigo-600 rounded-full"></div>
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <button className="p-2 rounded-full bg-gray-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-3 rounded-full bg-indigo-600 text-white">
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
                  onClick={() => logProgress(selectedContent)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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