// client/src/app/meditation/courses/page.tsx
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

interface MeditationCourse {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  totalSessions: number;
  meditations: Meditation[];
  isPremium: boolean;
  isEnrolled?: boolean;
  progress?: number;
}

// --- COMPONENT: COURSE CARD ---
const CourseCard = ({ 
  course, 
  onEnroll 
}: { 
  course: MeditationCourse; 
  onEnroll: (course: MeditationCourse) => void; 
}) => {
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
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-48">
        <img 
          src={course.imageUrl || '/images/meditation-default.jpg'} 
          alt={course.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/50 to-transparent flex flex-col justify-end p-4">
          <div className="flex items-center mb-2">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getLevelColor(course.level)}`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
            {course.isPremium && (
              <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Premium
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-white">{course.title}</h2>
          <div className="flex items-center text-white/80 text-xs mt-1">
            <span>{course.totalSessions} sessions</span>
            <span className="mx-2">•</span>
            <span>
              {course.meditations.reduce((total, m) => total + m.duration, 0)} min total
            </span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
        
        {course.isEnrolled ? (
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${course.progress || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {course.progress}% Complete
              </span>
              <Link 
                href={`/meditation/courses/${course._id}`}
                className="text-blue-600 text-sm font-medium hover:underline"
              >
                Continue
              </Link>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => onEnroll(course)} 
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );
};

// --- COMPONENT: FEATURED COURSE ---
const FeaturedCourse = ({ 
  course, 
  onEnroll 
}: { 
  course: MeditationCourse; 
  onEnroll: (course: MeditationCourse) => void; 
}) => {
  return (
    <div className="relative h-80 rounded-xl overflow-hidden shadow-md">
      <img 
        src={course.imageUrl || '/images/meditation-default.jpg'} 
        alt={course.title} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/60 to-transparent flex flex-col justify-end p-6">
        <div className="flex items-center mb-2">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800`}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </span>
          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Featured
          </span>
          {course.isPremium && (
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Premium
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
        <p className="text-white/80 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-white/90 text-sm">
            <span>{course.totalSessions} sessions</span>
            <span className="mx-2">•</span>
            <span>
              {course.meditations.reduce((total, m) => total + m.duration, 0)} min total
            </span>
          </div>
          
          {course.isEnrolled ? (
            <Link 
              href={`/meditation/courses/${course._id}`}
              className="bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Continue Course
            </Link>
          ) : (
            <button 
              onClick={() => onEnroll(course)} 
              className="bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function MeditationCoursesPage() {
  const [courses, setCourses] = useState<MeditationCourse[]>([]);
  const [featuredCourse, setFeaturedCourse] = useState<MeditationCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(
        'http://localhost:5001/api/meditation/courses',
        getAuthHeaders()
      );
      
      setCourses(response.data);
      
      // Set featured course (first course or random)
      if (response.data.length > 0) {
        // Find a beginner course for featured if possible
        const beginnerCourse = response.data.find(c => c.level === 'beginner');
        setFeaturedCourse(beginnerCourse || response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  // Handle course enrollment
  const handleEnroll = async (course: MeditationCourse) => {
    try {
      await axios.post(
        `http://localhost:5001/api/meditation/courses/${course._id}/enroll`,
        {},
        getAuthHeaders()
      );
      
      // Update course in state
      setCourses(prevCourses => 
        prevCourses.map(c => 
          c._id === course._id ? { ...c, isEnrolled: true, progress: 0 } : c
        )
      );
      
      if (featuredCourse && featuredCourse._id === course._id) {
        setFeaturedCourse({ ...featuredCourse, isEnrolled: true, progress: 0 });
      }
      
      // Show success message
      setEnrollmentSuccess(true);
      setTimeout(() => setEnrollmentSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      alert('Failed to enroll in course. Please try again.');
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
      
      fetchCourses();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchCourses]);

  // Filter courses based on active filter
  const filteredCourses = courses.filter(course => {
    if (activeFilter === 'all') return true;
    return course.level === activeFilter;
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading meditation courses...</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 pb-10">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Meditation Courses</h1>
            <Link 
              href="/meditation" 
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Meditation
            </Link>
          </div>
          
          {/* Success Message */}
          {enrollmentSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Successfully enrolled in course! You can now start your meditation journey.</span>
            </div>
          )}
          
          {/* Featured Course */}
          {featuredCourse && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Featured Course</h2>
              <FeaturedCourse 
                course={featuredCourse} 
                onEnroll={handleEnroll} 
              />
            </div>
          )}
          
          {/* Course Filters */}
          <div className="flex items-center mb-6">
            <h2 className="text-xl font-semibold mr-4">Browse Courses</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Levels
              </button>
              <button
                onClick={() => setActiveFilter('beginner')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'beginner'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setActiveFilter('intermediate')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'intermediate'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Intermediate
              </button>
              <button
                onClick={() => setActiveFilter('advanced')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  activeFilter === 'advanced'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
          
          {/* Course Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard 
                  key={course._id}
                  course={course}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                No courses found
              </h2>
              
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeFilter === 'all'
                  ? "We couldn't find any meditation courses. Please try again later."
                  : `We couldn't find any ${activeFilter} level courses. Try a different filter.`}
              </p>
              
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Courses
                </button>
              )}
            </div>
          )}
          
          {/* Benefits Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2 p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4">Benefits of Meditation Courses</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Structured progression from beginner to advanced techniques</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Guided practice with expert instructors</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Track your progress and build a consistent practice</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Learn different meditation styles and find what works for you</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Develop skills to manage stress, anxiety, and improve focus</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 bg-blue-600 p-6 md:p-8 text-white">
                <h2 className="text-xl font-semibold mb-4">How to Get Started</h2>
                <ol className="space-y-4 list-decimal pl-5">
                  <li className="pl-2">
                    <span className="font-medium">Choose your level</span>
                    <p className="text-white/80 mt-1">
                      If you're new to meditation, start with a beginner course to learn the fundamentals.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Enroll in a course</span>
                    <p className="text-white/80 mt-1">
                      Click "Enroll Now" on any course that interests you. All progress will be saved.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Set a schedule</span>
                    <p className="text-white/80 mt-1">
                      Consistency is key. Try to practice at the same time each day.
                    </p>
                  </li>
                  <li className="pl-2">
                    <span className="font-medium">Track your progress</span>
                    <p className="text-white/80 mt-1">
                      Complete sessions to build your meditation streak and see your improvement.
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}