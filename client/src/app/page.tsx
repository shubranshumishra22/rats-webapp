'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import EventReminders from '@/components/EventReminders';
import { motion } from 'framer-motion';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Get username from token
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUsername(decodedToken.username);
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          borderRadius: '50%', 
          border: '4px solid #e5e7eb',
          borderTopColor: '#4f46e5',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(to bottom, #eef2ff, #e0e7ff)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '2rem 1rem'
        }}>
          {/* Modern Welcome Header */}
          <header style={{ 
            marginBottom: '3rem',
            padding: '2rem 0'
          }}>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-xl"
            >
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              
              {username && (
                <div className="relative z-10">
                  <h2 className="text-white text-3xl font-bold mb-2">
                    Welcome back, {username}!
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Ready for another day of wellness? Here's your personalized dashboard.
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                      <span className="block text-xl font-bold">Today's Goal</span>
                      <span className="text-sm">Complete your meditation session</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                      <span className="block text-xl font-bold">Streak</span>
                      <span className="text-sm">Start today! 🔥</span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 text-white">
                      <span className="block text-xl font-bold">Mood</span>
                      <span className="text-sm">Track today's mood →</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </header>

          {/* Activity Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Meditation Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-40 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-4xl">🧘</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <h3 className="text-white text-xl font-bold">Daily Meditation</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">5-minute session</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Recommended</span>
                </div>
                <p className="text-gray-600 mb-5">Reduce stress and improve focus with a quick guided meditation.</p>
                <Link href="/meditation" className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2 rounded-lg font-medium transition-colors">
                  Start Now
                </Link>
              </div>
            </motion.div>
            
            {/* Nutrition Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-40 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-4xl">🥗</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <h3 className="text-white text-xl font-bold">Nutrition Tracker</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Today's progress</span>
                  <div className="w-16 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <p className="text-gray-600 mb-5">Track your meals and get AI-powered nutrition insights.</p>
                <Link href="/nutrition" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-2 rounded-lg font-medium transition-colors">
                  Log Meal
                </Link>
              </div>
            </motion.div>
            
            {/* Community Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-40 bg-gradient-to-r from-pink-500 to-rose-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-4xl">👥</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/50 to-transparent">
                  <h3 className="text-white text-xl font-bold">Community</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">5 new posts</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Hot</span>
                </div>
                <p className="text-gray-600 mb-5">Connect with others and share your wellness journey.</p>
                <Link href="/community" className="block w-full bg-pink-600 hover:bg-pink-700 text-white text-center py-2 rounded-lg font-medium transition-colors">
                  Join Discussion
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Upcoming Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">📅</span> Upcoming Events
              </h2>
              <Link href="/events/new" className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Event
              </Link>
            </div>
            
            {/* Event Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border-l-4 border-amber-400">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-800 text-sm font-medium">Tomorrow</p>
                    <h3 className="font-bold text-gray-800 mt-1">Team Yoga Session</h3>
                  </div>
                  <span className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full">9:00 AM</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Join the virtual yoga session with the wellness team.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-400">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-blue-800 text-sm font-medium">This Friday</p>
                    <h3 className="font-bold text-gray-800 mt-1">Nutrition Workshop</h3>
                  </div>
                  <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">2:00 PM</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">Learn about balanced meal planning with our nutrition expert.</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-l-4 border-purple-400">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-purple-800 text-sm font-medium">Next Week</p>
                    <h3 className="font-bold text-gray-800 mt-1">Mindfulness Challenge</h3>
                  </div>
                  <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">All Day</span>
                </div>
                <p className="text-gray-600 text-sm mt-2">7-day challenge to build your mindfulness practice.</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <EventReminders />
              <Link href="/events" className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center">
                View All Events
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </motion.div>
          
          {/* Features Grid */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Explore More Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Goals Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Goal Tracking</h3>
                <p className="text-gray-600 text-sm mb-4">Set personal goals and track your progress over time.</p>
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  View Goals
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Your Profile</h3>
                <p className="text-gray-600 text-sm mb-4">Update your information and track your achievements.</p>
                <Link href="/profile" className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center">
                  View Profile
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            {/* Events Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">All Events</h3>
                <p className="text-gray-600 text-sm mb-4">Browse and join upcoming wellness events and activities.</p>
                <Link href="/events" className="text-amber-600 hover:text-amber-800 text-sm font-medium flex items-center">
                  Browse Events
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
            
            {/* Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-5">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Settings</h3>
                <p className="text-gray-600 text-sm mb-4">Customize your experience and notification preferences.</p>
                <Link href="/settings" className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                  Manage Settings
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Activity Streak Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl p-6 text-white mb-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
            
            <div className="relative z-10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Start Your Streak Today!</h3>
                  <p className="text-blue-100">Log your first meal to begin your wellness journey</p>
                </div>
              </div>
              
              <div className="flex space-x-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7].map((day, i) => (
                  <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white/10`}>
                    <span className="text-sm">{i+1}</span>
                  </div>
                ))}
              </div>
              
              <Link href="/nutrition" className="inline-block bg-white text-indigo-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors">
                Log Your First Meal
              </Link>
            </div>
          </motion.div>

          {/* Motivational Quote */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md p-8 mb-12 text-center"
          >
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-xl text-gray-600 italic mb-4">
              "The greatest wealth is health. Take care of your body. It's the only place you have to live."
            </p>
            <p className="text-gray-500 font-medium">— Virgil</p>
          </motion.div>

          {/* Footer */}
          <footer style={{ 
            marginTop: '5rem', 
            textAlign: 'center', 
            color: '#6b7280',
            padding: '2rem 0'
          }}>
            <p style={{ marginBottom: '0.5rem' }}>© 2023 RATS - Resilience, Awareness, Tranquility, Strength</p>
            <p>Your journey to wellness starts here.</p>
          </footer>
        </div>
      </div>
    </ClientOnly>
  );
}