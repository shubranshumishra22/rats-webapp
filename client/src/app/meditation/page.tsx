// client/src/app/meditation/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface Meditation {
  _id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  duration: number;
  category: string;
  level: string;
  tags: string[];
  isFeatured: boolean;
  isPremium: boolean;
}

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
}

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

interface MeditationRecommendations {
  meditations: Meditation[];
  sleepContent: SleepContent[];
}

// --- COMPONENT: FEATURED MEDITATION CARD ---
const FeaturedMeditationCard = ({ 
  meditation, 
  onPlay 
}: { 
  meditation: Meditation; 
  onPlay: (meditation: Meditation) => void; 
}) => {
  return (
    <div className="relative h-64 rounded-xl overflow-hidden shadow-md">
      <img 
        src={meditation.imageUrl || '/images/meditation-default.jpg'} 
        alt={meditation.title} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/50 to-transparent flex flex-col justify-end p-6">
        <div className="flex items-center mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Featured
          </span>
          {meditation.isPremium && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white mb-1">{meditation.title}</h2>
        <p className="text-white/80 text-sm mb-3 line-clamp-2">{meditation.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white/90 text-sm">
            <span>{meditation.duration} min</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{meditation.level}</span>
          </div>
          <button 
            onClick={() => onPlay(meditation)} 
            className="bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Play Now
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: MEDITATION CARD ---
const MeditationCard = ({ 
  meditation, 
  onPlay 
}: { 
  meditation: Meditation; 
  onPlay: (meditation: Meditation) => void; 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-40">
        <img 
          src={meditation.imageUrl || '/images/meditation-default.jpg'} 
          alt={meditation.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent flex items-end p-4">
          <div>
            <h3 className="text-white font-semibold">{meditation.title}</h3>
            <div className="flex items-center mt-1 text-xs text-white/80">
              <span>{meditation.duration} min</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{meditation.level}</span>
              {meditation.isPremium && (
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
        <p className="text-sm text-gray-600 line-clamp-2">{meditation.description}</p>
        <button 
          onClick={() => onPlay(meditation)} 
          className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Play
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: SLEEP CONTENT CARD ---
const SleepContentCard = ({ 
  content, 
  onPlay 
}: { 
  content: SleepContent; 
  onPlay: (content: SleepContent) => void; 
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
        <button 
          onClick={() => onPlay(content)} 
          className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Play
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT: PROGRESS CARD ---
const ProgressCard = ({ 
  progress 
}: { 
  progress: MeditationProgress; 
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  
  return (
    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
        progress.contentType === 'Meditation' ? 'bg-blue-100 text-blue-600' :
        progress.contentType === 'SleepContent' ? 'bg-indigo-100 text-indigo-600' :
        'bg-purple-100 text-purple-600'
      }`}>
        {getIcon(progress.contentType)}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-800">{progress.meditation.title}</h4>
        <div className="flex items-center text-xs text-gray-500">
          <span>{progress.duration} min</span>
          <span className="mx-1">•</span>
          <span>{formatDate(progress.completedAt)}</span>
          {progress.mood && (
            <>
              <span className="mx-1">•</span>
              <span className="capitalize">{progress.mood}</span>
            </>
          )}
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

// --- IMPORT AI AND GAMIFICATION COMPONENTS ---
import AIMeditationGuide from '@/components/meditation/AIMeditationGuide';
import MeditationGame from '@/components/meditation/MeditationGame';
import MeditationRewards from '@/components/meditation/MeditationRewards';

// --- MAIN PAGE COMPONENT ---
export default function MeditationDashboardPage() {
  const [featuredMeditation, setFeaturedMeditation] = useState<Meditation | null>(null);
  const [recommendations, setRecommendations] = useState<MeditationRecommendations>({
    meditations: [],
    sleepContent: []
  });
  const [recentProgress, setRecentProgress] = useState<MeditationProgress[]>([]);
  const [stats, setStats] = useState<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [showGameMode, setShowGameMode] = useState(false);
  const [gameTheme, setGameTheme] = useState<'forest' | 'ocean' | 'space' | 'mountain'>('forest');
  const [userMood, setUserMood] = useState<string>('neutral');
  const [showAchievement, setShowAchievement] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch meditation data
  const fetchMeditationData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch recommendations
      const recommendationsResponse = await axios.get(
        'http://localhost:5001/api/meditation/recommendations',
        getAuthHeaders()
      );
      
      setRecommendations(recommendationsResponse.data);
      
      // Set featured meditation (first featured meditation from recommendations)
      const featured = recommendationsResponse.data.meditations.find((m: Meditation) => m.isFeatured);
      setFeaturedMeditation(featured || recommendationsResponse.data.meditations[0]);
      
      // Fetch recent progress
      const progressResponse = await axios.get(
        'http://localhost:5001/api/meditation/progress?limit=5',
        getAuthHeaders()
      );
      
      setRecentProgress(progressResponse.data.progress);
      
      // Fetch stats
      const statsResponse = await axios.get(
        'http://localhost:5001/api/meditation/stats',
        getAuthHeaders()
      );
      
      setStats(statsResponse.data);
      
      // Detect user mood based on time of day and recent activity
      const detectUserMood = () => {
        const hour = new Date().getHours();
        const recentMoods = progressResponse.data.progress
          .filter((p: MeditationProgress) => p.mood)
          .map((p: MeditationProgress) => p.mood);
        
        // Morning (5am-11am): Energetic or Sleepy
        if (hour >= 5 && hour < 11) {
          return hour < 8 ? 'sleepy' : 'energetic';
        }
        
        // Afternoon (11am-5pm): Focused or Stressed
        if (hour >= 11 && hour < 17) {
          return statsResponse.data.currentStreak > 2 ? 'focused' : 'stressed';
        }
        
        // Evening (5pm-10pm): Relaxed or Tired
        if (hour >= 17 && hour < 22) {
          return 'tired';
        }
        
        // Night (10pm-5am): Calm or Restless
        return hour >= 22 || hour < 5 ? 'restless' : 'calm';
      };
      
      setUserMood(detectUserMood());
      
      // Randomly select a game theme based on user's favorite categories
      if (statsResponse.data.favoriteCategories && statsResponse.data.favoriteCategories.length > 0) {
        const category = statsResponse.data.favoriteCategories[0].toLowerCase();
        if (category.includes('nature') || category.includes('mindful')) {
          setGameTheme('forest');
        } else if (category.includes('sleep') || category.includes('relax')) {
          setGameTheme('ocean');
        } else if (category.includes('focus') || category.includes('energy')) {
          setGameTheme('mountain');
        } else {
          setGameTheme('space');
        }
      }
      
      // Check for new achievements (this would be from the API in a real app)
      if (statsResponse.data.currentStreak === 3 || statsResponse.data.totalSessions === 10) {
        const mockAchievement = {
          id: statsResponse.data.currentStreak === 3 ? 'daily-streak-3' : 'total-sessions-10',
          title: statsResponse.data.currentStreak === 3 ? 'Consistent Mind' : 'Meditation Enthusiast',
          description: statsResponse.data.currentStreak === 3 
            ? 'Complete 3 consecutive days of meditation' 
            : 'Complete 10 meditation sessions',
          icon: statsResponse.data.currentStreak === 3 ? '🔥' : '🧘',
        };
        setNewAchievement(mockAchievement);
        
        // Show achievement notification after a delay
        setTimeout(() => {
          setShowAchievement(true);
          // Hide after 5 seconds
          setTimeout(() => setShowAchievement(false), 5000);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to fetch meditation data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle play meditation
  const handlePlayMeditation = (meditation: Meditation) => {
    setSelectedContent({
      ...meditation,
      contentType: 'Meditation'
    });
    setIsPlayerOpen(true);
  };

  // Handle play sleep content
  const handlePlaySleepContent = (content: SleepContent) => {
    setSelectedContent({
      ...content,
      contentType: 'SleepContent'
    });
    setIsPlayerOpen(true);
  };

  // Log meditation progress
  const logProgress = async () => {
    if (!selectedContent) return;
    
    try {
      await axios.post(
        'http://localhost:5001/api/meditation/progress',
        {
          meditationId: selectedContent._id,
          contentType: selectedContent.contentType,
          duration: selectedContent.duration,
          mood: userMood, // Use detected mood
        },
        getAuthHeaders()
      );
      
      // Close player and refresh data
      setIsPlayerOpen(false);
      setSelectedContent(null);
      setShowGameMode(false);
      fetchMeditationData();
    } catch (error) {
      console.error('Failed to log progress:', error);
    }
  };
  
  // Handle AI suggestion selection
  const handleAISuggestionSelect = (suggestion: string) => {
    // Find a meditation that matches the suggestion
    const matchingMeditation = recommendations.meditations.find(
      m => m.title.toLowerCase().includes(suggestion.toLowerCase()) || 
           m.category.toLowerCase().includes(suggestion.toLowerCase()) ||
           m.tags.some(tag => tag.toLowerCase().includes(suggestion.toLowerCase()))
    );
    
    if (matchingMeditation) {
      handlePlayMeditation(matchingMeditation);
    } else {
      // If no match, just show the game mode with the suggestion as a theme hint
      const themeMap: {[key: string]: 'forest' | 'ocean' | 'space' | 'mountain'} = {
        'breathing': 'forest',
        'mindful': 'forest',
        'body scan': 'mountain',
        'loving': 'ocean',
        'sleep': 'ocean',
        'focus': 'mountain',
        'energy': 'space',
        'stress': 'ocean'
      };
      
      // Find a matching theme or default to forest
      let newTheme: 'forest' | 'ocean' | 'space' | 'mountain' = 'forest';
      for (const [key, value] of Object.entries(themeMap)) {
        if (suggestion.toLowerCase().includes(key)) {
          newTheme = value;
          break;
        }
      }
      
      setGameTheme(newTheme);
      setShowGameMode(true);
    }
  };
  
  // Handle game completion
  const handleGameComplete = () => {
    // Log progress for the game session
    try {
      axios.post(
        'http://localhost:5001/api/meditation/progress',
        {
          contentType: 'GameMeditation',
          duration: 5, // Default game duration
          mood: userMood,
          theme: gameTheme
        },
        getAuthHeaders()
      );
      
      // Refresh data
      fetchMeditationData();
    } catch (error) {
      console.error('Failed to log game progress:', error);
    }
    
    // Hide game mode
    setTimeout(() => {
      setShowGameMode(false);
    }, 2000);
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
      
      fetchMeditationData();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchMeditationData]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading meditation dashboard...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Meditation & Mindfulness</h1>
          
          {/* Navigation Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/meditation/courses" className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="mb-auto">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h2 className="font-semibold text-lg">Courses</h2>
                </div>
                <p className="text-sm text-white/80 mt-2">Structured meditation programs</p>
              </div>
            </Link>
            
            <Link href="/meditation/sleep" className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="mb-auto">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <h2 className="font-semibold text-lg">Sleep</h2>
                </div>
                <p className="text-sm text-white/80 mt-2">Stories and sounds for better sleep</p>
              </div>
            </Link>
            
            <Link href="/meditation/custom" className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="mb-auto">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <h2 className="font-semibold text-lg">Custom</h2>
                </div>
                <p className="text-sm text-white/80 mt-2">Create your own meditations</p>
              </div>
            </Link>
            
            <Link href="/meditation/saved" className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full">
                <div className="mb-auto">
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <h2 className="font-semibold text-lg">Saved</h2>
                </div>
                <p className="text-sm text-white/80 mt-2">Your saved meditations</p>
              </div>
            </Link>
          </div>
          
          {/* AI Meditation Guide */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Personal AI Guide</h2>
              <button 
                onClick={() => setShowGameMode(true)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
                Try Game Mode
              </button>
            </div>
            <AIMeditationGuide 
              userMood={userMood}
              meditationHistory={{
                totalSessions: stats.totalSessions,
                totalMinutes: stats.totalMinutes,
                recentCategories: stats.favoriteCategories || [],
                preferredDuration: 10
              }}
              userGoals={['Reduce stress', 'Improve focus', 'Better sleep']}
              onSuggestionSelect={handleAISuggestionSelect}
            />
          </div>
          
          {/* Featured Meditation */}
          {featuredMeditation && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Featured Meditation</h2>
              </div>
              <FeaturedMeditationCard 
                meditation={featuredMeditation} 
                onPlay={handlePlayMeditation} 
              />
            </div>
          )}
          
          {/* Stats Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Your Meditation Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
          
          {/* Two Column Layout for Recommendations and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recommendations */}
            <div className="lg:col-span-2">
              {/* Recommended Meditations */}
              {recommendations.meditations.length > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Recommended For You</h2>
                    <Link href="/meditation/courses" className="text-blue-600 hover:underline text-sm">
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.meditations.slice(0, 4).map(meditation => (
                      <MeditationCard 
                        key={meditation._id}
                        meditation={meditation}
                        onPlay={handlePlayMeditation}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sleep Content */}
              {recommendations.sleepContent.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Sleep & Relaxation</h2>
                    <Link href="/meditation/sleep" className="text-indigo-600 hover:underline text-sm">
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.sleepContent.slice(0, 2).map(content => (
                      <SleepContentCard 
                        key={content._id}
                        content={content}
                        onPlay={handlePlaySleepContent}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Recent Progress */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Recent Activity</h2>
                </div>
                
                {recentProgress.length > 0 ? (
                  <div className="space-y-3">
                    {recentProgress.map(progress => (
                      <ProgressCard 
                        key={progress._id}
                        progress={progress}
                      />
                    ))}
                    
                    <Link 
                      href="/meditation/progress" 
                      className="block text-center text-blue-600 hover:underline text-sm mt-4"
                    >
                      View All Activity
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No Activity Yet</h3>
                    <p className="text-gray-600 mb-4">Start your meditation journey today</p>
                    <button 
                      onClick={() => featuredMeditation && handlePlayMeditation(featuredMeditation)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try a Meditation
                    </button>
                  </div>
                )}
              </div>
              
              {/* Meditation Rewards */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Achievements</h2>
                </div>
                <MeditationRewards 
                  userId="current-user"
                  onAchievementClick={(achievement) => {
                    // Show achievement details or trigger related meditation
                    if (achievement.isCompleted && achievement.reward) {
                      // Find related reward
                      const relatedReward = recommendations.meditations.find(
                        m => m.title.toLowerCase().includes(achievement.reward!.toLowerCase())
                      );
                      if (relatedReward) {
                        handlePlayMeditation(relatedReward);
                      }
                    }
                  }}
                  onRewardClick={(reward) => {
                    // Apply the reward theme or content
                    if (reward.isUnlocked) {
                      if (reward.title.toLowerCase().includes('ocean')) {
                        setGameTheme('ocean');
                      } else if (reward.title.toLowerCase().includes('forest')) {
                        setGameTheme('forest');
                      } else if (reward.title.toLowerCase().includes('morning')) {
                        setGameTheme('mountain');
                      } else {
                        setGameTheme('space');
                      }
                      setShowGameMode(true);
                    }
                  }}
                />
              </div>
              
              {/* Quick Links */}
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
                <div className="space-y-3">
                  <Link href="/meditation/downloads" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Downloads</h3>
                      <p className="text-xs text-gray-600">Access offline content</p>
                    </div>
                  </Link>
                  
                  <Link href="/meditation/custom/create" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Create Custom</h3>
                      <p className="text-xs text-gray-600">Design your own meditation</p>
                    </div>
                  </Link>
                  
                  <Link href="/meditation/settings" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mr-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Settings</h3>
                      <p className="text-xs text-gray-600">Customize your experience</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
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
        
        {/* Game Mode Modal */}
        {showGameMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-3xl w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Mindful Meditation Game</h3>
                <button 
                  onClick={() => setShowGameMode(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <MeditationGame 
                duration={5} 
                theme={gameTheme}
                onComplete={handleGameComplete}
              />
            </div>
          </div>
        )}
        
        {/* Achievement Notification */}
        {showAchievement && newAchievement && (
          <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden z-50 animate-slide-up">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                  <span className="text-2xl">{newAchievement.icon}</span>
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Achievement Unlocked!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {newAchievement.title}: {newAchievement.description}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
                    onClick={() => setShowAchievement(false)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-green-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-green-800">
                  Keep up the great work!
                </p>
                <button
                  type="button"
                  className="text-xs font-medium text-green-700 hover:text-green-600"
                  onClick={() => {
                    setShowAchievement(false);
                    setShowGameMode(true);
                  }}
                >
                  Try Game Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}