// client/src/app/meditation/courses/[id]/page.tsx
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
  isCompleted?: boolean;
}

interface MeditationCourse {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalSessions: number;
  meditations: Meditation[];
  isPremium: boolean;
  progress: number;
  completedSessions: number;
}

// --- COMPONENT: SESSION CARD ---
const SessionCard = ({ 
  session, 
  index,
  onPlay,
  isLocked
}: { 
  session: Meditation; 
  index: number;
  onPlay: (session: Meditation) => void;
  isLocked: boolean;
}) => {
  return (
    <div className={`bg-white rounded-lg border ${
      session.isCompleted 
        ? 'border-green-200' 
        : isLocked 
          ? 'border-gray-200 opacity-70' 
          : 'border-blue-200'
    }`}>
      <div className="p-4 flex items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
          session.isCompleted 
            ? 'bg-green-100 text-green-600' 
            : isLocked 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-blue-100 text-blue-600'
        }`}>
          {session.isCompleted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : isLocked ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <span className="font-medium">{index + 1}</span>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-medium ${
            isLocked ? 'text-gray-500' : 'text-gray-800'
          }`}>
            {session.title}
          </h3>
          <div className="flex items-center text-xs mt-1">
            <span className={isLocked ? 'text-gray-400' : 'text-gray-500'}>
              {session.duration} min
            </span>
            <span className={`mx-2 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>•</span>
            <span className={`capitalize ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
              {session.category}
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => !isLocked && onPlay(session)} 
          disabled={isLocked}
          className={`p-2 rounded-full ${
            session.isCompleted 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : isLocked 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          {session.isCompleted ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<MeditationCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Meditation | null>(null);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch course details
  const fetchCourseDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(
        `http://localhost:5001/api/meditation/courses/${params.id}`,
        getAuthHeaders()
      );
      
      setCourse(response.data);
    } catch (error) {
      console.error('Failed to fetch course details:', error);
      router.push('/meditation/courses');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, getAuthHeaders, router]);

  // Handle play session
  const handlePlaySession = (session: Meditation) => {
    setSelectedSession(session);
    setIsPlayerOpen(true);
    setIsSessionCompleted(!!session.isCompleted);
  };

  // Complete session
  const completeSession = async () => {
    if (!selectedSession || !course) return;
    
    try {
      await axios.post(
        `http://localhost:5001/api/meditation/courses/${course._id}/sessions/${selectedSession._id}/complete`,
        {},
        getAuthHeaders()
      );
      
      // Update session in state
      setCourse(prevCourse => {
        if (!prevCourse) return null;
        
        const updatedMeditations = prevCourse.meditations.map(m => 
          m._id === selectedSession._id ? { ...m, isCompleted: true } : m
        );
        
        // Calculate new progress
        const completedCount = updatedMeditations.filter(m => m.isCompleted).length;
        const progress = Math.round((completedCount / updatedMeditations.length) * 100);
        
        return {
          ...prevCourse,
          meditations: updatedMeditations,
          completedSessions: completedCount,
          progress
        };
      });
      
      setIsSessionCompleted(true);
      
      // Log meditation progress
      await axios.post(
        'http://localhost:5001/api/meditation/progress',
        {
          meditationId: selectedSession._id,
          contentType: 'Meditation',
          duration: selectedSession.duration,
          courseId: course._id,
          mood: 'calm', // Default mood
        },
        getAuthHeaders()
      );
    } catch (error) {
      console.error('Failed to complete session:', error);
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
      
      fetchCourseDetails();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchCourseDetails]);

  // Get level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading course details...</div>;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">
            The course you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link 
            href="/meditation/courses" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Link 
              href="/meditation/courses" 
              className="text-blue-600 hover:underline text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Courses
            </Link>
            
            <div className="flex items-center">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
              {course.isPremium && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>
          </div>
          
          {/* Course Header */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="relative h-48">
              <img 
                src={course.imageUrl || '/images/meditation-default.jpg'} 
                alt={course.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">{course.title}</h1>
                  <div className="flex items-center text-white/80 text-sm mt-1">
                    <span>{course.totalSessions} sessions</span>
                    <span className="mx-2">•</span>
                    <span>
                      {course.meditations.reduce((total, m) => total + m.duration, 0)} min total
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {course.completedSessions} of {course.totalSessions} sessions completed
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {course.progress}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-700">{course.description}</p>
              
              {course.progress === 100 && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-medium text-green-800">Course Completed!</h3>
                    <p className="text-sm text-green-700">
                      Congratulations on completing this meditation course.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sessions List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Course Sessions</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {course.meditations.map((session, index) => {
                  // Determine if session should be locked
                  // Logic: Lock sessions if previous session is not completed (except first session)
                  const isLocked = index > 0 && 
                    !course.meditations[index - 1].isCompleted && 
                    !session.isCompleted;
                  
                  return (
                    <SessionCard 
                      key={session._id}
                      session={session}
                      index={index}
                      onPlay={handlePlaySession}
                      isLocked={isLocked}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Audio Player Modal (simplified) */}
        {isPlayerOpen && selectedSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-2">{selectedSession.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{selectedSession.description}</p>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">0:00</span>
                  <span className="text-sm text-gray-500">{selectedSession.duration}:00</span>
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
                  onClick={completeSession}
                  disabled={isSessionCompleted}
                  className={`px-4 py-2 rounded-lg ${
                    isSessionCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSessionCompleted ? 'Completed' : 'Complete Session'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}