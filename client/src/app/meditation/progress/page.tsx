// client/src/app/meditation/progress/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface MeditationProgress {
  _id: string;
  meditation: {
    _id: string;
    title: string;
    duration: number;
    category: string;
  };
  contentType: 'Meditation' | 'SleepContent' | 'CustomMeditation';
  completedAt: string;
  duration: number;
  mood?: string;
}

interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastMeditationDate?: string;
  favoriteCategories?: string[];
}

// --- COMPONENT: PROGRESS CARD ---
const ProgressCard = ({ 
  progress 
}: { 
  progress: MeditationProgress; 
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Get icon based on content type
  const getIcon = (contentType: string) => {
    switch (contentType) {
      case 'Meditation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'SleepContent':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        );
      case 'CustomMeditation':
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
  
  // Get color based on content type
  const getColorClass = (contentType: string) => {
    switch (contentType) {
      case 'Meditation':
        return 'bg-blue-100 text-blue-600';
      case 'SleepContent':
        return 'bg-indigo-100 text-indigo-600';
      case 'CustomMeditation':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getColorClass(progress.contentType)}`}>
          {getIcon(progress.contentType)}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-800">{progress.meditation.title}</h3>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span>{progress.duration} min</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{progress.meditation.category || 'meditation'}</span>
            {progress.mood && (
              <>
                <span className="mx-2">•</span>
                <span className="capitalize">Mood: {progress.mood}</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {formatDate(progress.completedAt)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {progress.contentType === 'Meditation' ? 'Meditation' : 
             progress.contentType === 'SleepContent' ? 'Sleep' : 'Custom'}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: STATS CARD ---
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue' 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  color?: 'blue' | 'green' | 'purple' | 'indigo'; 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    indigo: 'bg-indigo-50 text-indigo-700',
  };
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: CALENDAR HEATMAP (SIMPLIFIED) ---
const CalendarHeatmap = ({ 
  progressData 
}: { 
  progressData: MeditationProgress[]; 
}) => {
  // Group progress by date
  const progressByDate = progressData.reduce((acc: Record<string, MeditationProgress[]>, progress) => {
    const date = new Date(progress.completedAt).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(progress);
    return acc;
  }, {});
  
  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };
  
  // Get intensity based on number of sessions
  const getIntensity = (date: string) => {
    const sessions = progressByDate[date]?.length || 0;
    if (sessions === 0) return 'bg-gray-100';
    if (sessions === 1) return 'bg-blue-200';
    if (sessions === 2) return 'bg-blue-300';
    return 'bg-blue-500';
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-800 mb-4">Last 7 Days</h3>
      <div className="flex justify-between">
        {last7Days.map(date => (
          <div key={date} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-md ${getIntensity(date)} flex items-center justify-center mb-1`}>
              <span className="text-xs font-medium text-gray-800">
                {progressByDate[date]?.length || 0}
              </span>
            </div>
            <span className="text-xs text-gray-600">{formatDate(date)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: FAVORITE CATEGORIES ---
const FavoriteCategories = ({ 
  categories = [] 
}: { 
  categories?: string[]; 
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-800 mb-2">Favorite Categories</h3>
        <p className="text-sm text-gray-600">
          You haven't meditated enough to determine your favorite categories yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-800 mb-3">Favorite Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <span 
            key={category}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function MeditationProgressPage() {
  const [progressData, setProgressData] = useState<MeditationProgress[]>([]);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch progress data
  const fetchProgressData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build query params
      let queryParams = '';
      if (dateRange.startDate) {
        queryParams += `startDate=${dateRange.startDate}`;
      }
      if (dateRange.endDate) {
        queryParams += queryParams ? `&endDate=${dateRange.endDate}` : `endDate=${dateRange.endDate}`;
      }
      
      const url = `http://localhost:5001/api/meditation/progress${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await axios.get(url, getAuthHeaders());
      
      setProgressData(response.data.progress);
      
      // Fetch stats
      const statsResponse = await axios.get(
        'http://localhost:5001/api/meditation/stats',
        getAuthHeaders()
      );
      
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, dateRange]);

  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const today = new Date();
    let startDate = '';
    
    switch (value) {
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date();
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDate = yearAgo.toISOString().split('T')[0];
        break;
      default:
        startDate = '';
    }
    
    setDateRange({
      startDate,
      endDate: today.toISOString().split('T')[0]
    });
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
      
      fetchProgressData();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchProgressData]);

  // Fetch data when date range changes
  useEffect(() => {
    fetchProgressData();
  }, [dateRange, fetchProgressData]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading progress data...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Meditation Progress</h1>
            <Link 
              href="/meditation" 
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Meditation
            </Link>
          </div>
          
          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard 
              title="Total Sessions" 
              value={stats.totalSessions} 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              } 
              color="blue"
            />
            
            <StatsCard 
              title="Total Minutes" 
              value={stats.totalMinutes} 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
              color="green"
            />
            
            <StatsCard 
              title="Current Streak" 
              value={stats.currentStreak} 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              } 
              color="purple"
            />
            
            <StatsCard 
              title="Longest Streak" 
              value={stats.longestStreak} 
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              } 
              color="indigo"
            />
          </div>
          
          {/* Insights Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <CalendarHeatmap progressData={progressData} />
            <FavoriteCategories categories={stats.favoriteCategories} />
          </div>
          
          {/* Progress History */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Meditation History</h2>
                
                <div className="flex items-center">
                  <label htmlFor="dateRange" className="mr-2 text-sm text-gray-600">
                    Time Period:
                  </label>
                  <select
                    id="dateRange"
                    onChange={handleDateRangeChange}
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Time</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {progressData.length > 0 ? (
                <div className="space-y-4">
                  {progressData.map(progress => (
                    <ProgressCard 
                      key={progress._id}
                      progress={progress}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Meditation History</h3>
                  <p className="text-gray-600 mb-4">
                    {dateRange.startDate 
                      ? "You haven't completed any meditations in the selected time period." 
                      : "You haven't completed any meditations yet."}
                  </p>
                  <Link 
                    href="/meditation" 
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Meditating
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}