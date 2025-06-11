'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Navigation Link Component
interface NavLinkProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavLink({ href, label, isActive }: NavLinkProps) {
  return (
    <a 
      href={href}
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full
        ${isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
      {label}
    </a>
  );
}

// Recent Meal Thumbnail Component
interface RecentMealThumbnailProps {
  name: string;
}

function RecentMealThumbnail({ name }: RecentMealThumbnailProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-gray-200 rounded-lg aspect-square w-full"></div>
      <span className="text-xs mt-1 text-gray-600">{name}</span>
    </div>
  );
}

// --- Human Body Component with Image, Fill Effect, and Glow ---
const BodyVisualizer = ({ percentage }: { percentage: number }) => {
  const fillHeight = Math.min(100, Math.max(0, percentage));
  return (
    <div className="relative w-56 h-112 mx-auto">
      {/* Human Blueprint Image with Glow */}
      <img 
        src="/body.png" 
        alt="Human Blueprint" 
        className="absolute w-full h-full object-contain z-10"
        style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.7))' }}
      />
      {/* Fill Overlay with Smooth Transition */}
      <div 
        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-blue-500/70 to-blue-300/30 z-5"
        style={{ height: `${fillHeight}%`, transition: 'height 0.5s ease-in-out' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20">
        <p className="text-4xl font-bold text-white drop-shadow-lg">{fillHeight.toFixed(0)}%</p>
        <p className="text-sm text-white/60">Goal Met</p>
      </div>
    </div>
  );
};

// --- TYPE DEFINITIONS ---
interface FoodLog { 
  _id: string; 
  foodName: string; 
  calories: number; 
  protein: number; 
  carbs: number; 
  fat: number; 
  createdAt: string; 
}

interface UserProfile { 
  dailyCalorieGoal: number; 
  streak: number; 
  username: string; 
}

export default function NutritionProgress() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  // User data
  const [todaysLogs, setTodaysLogs] = useState<FoodLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [goalInput, setGoalInput] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = useCallback(() => ({ 
    headers: { Authorization: `Bearer ${localStorage.getItem('rats_token')}` } 
  }), []);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, foodRes] = await Promise.all([
        axios.get('http://localhost:5001/api/users/profile/me', getAuthHeaders()),
        axios.get('http://localhost:5001/api/food/today', getAuthHeaders())
      ]);
      setUserProfile(profileRes.data);
      setTodaysLogs(foodRes.data);
    } catch (error) { 
      console.error('Failed to fetch data:', error); 
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const initialLoad = async () => {
      setIsMounted(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('rats_token');
      if (!token) { 
        router.push('/login'); 
        return; 
      }
      
      try {
        setIsLoading(true);
        await fetchData();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    initialLoad();
  }, [router, fetchData]);

  useEffect(() => {
    if (userProfile) {
      setGoalInput(userProfile.dailyCalorieGoal);
    }
  }, [userProfile]);

  const dailyTotals = useMemo(() => {
    return todaysLogs.reduce((acc, log) => {
      acc.calories += log.calories || 0;
      acc.protein += log.protein || 0;
      acc.carbs += log.carbs || 0;
      acc.fat += log.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysLogs]);

  const handleUpdateGoal = async () => {
    if(goalInput === '' || Number(goalInput) <= 0) return alert("Please enter a valid goal.");
    try {
      await axios.put('http://localhost:5001/api/users/goal', { dailyCalorieGoal: goalInput }, getAuthHeaders());
      setUserProfile(prev => prev ? { ...prev, dailyCalorieGoal: Number(goalInput) } : null);
      alert("Goal updated successfully!");
    } catch (error) { 
      alert("Failed to update goal."); 
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <NavLink href="/nutrition" label="🏠 Home" isActive={false} />
              <NavLink href="/nutrition/chat" label="💬 Chat" isActive={false} />
              <NavLink href="/nutrition/progress" label="📊 Progress" isActive={true} />
            </div>
            <div className="flex items-center">
              <button className="text-red-600 hover:text-red-800 font-medium">
                🔒 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column: Body Visualizer */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Daily Progress</h2>
              <div className="bg-orange-500/10 text-orange-500 font-bold px-3 py-1 rounded-full flex items-center">
                {userProfile?.streak || 0} <span className="ml-1 text-lg">🔥</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <BodyVisualizer percentage={(dailyTotals.calories / (userProfile?.dailyCalorieGoal || 2000)) * 100} />
            </div>
            
            <p className="text-center font-bold text-3xl mt-4">
              {dailyTotals.calories.toFixed(0)} <span className="text-gray-500 text-xl">/ {userProfile?.dailyCalorieGoal} kcal</span>
            </p>
            
            <div className="mt-6">
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 text-center">Set Your Daily Goal</label>
              <div className="mt-1 flex gap-2">
                <input 
                  type="number" 
                  id="goal" 
                  value={goalInput} 
                  onChange={e => setGoalInput(Number(e.target.value))} 
                  className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  onClick={handleUpdateGoal} 
                  className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Set
                </button>
              </div>
            </div>
          </div>
          
          {/* Center Column: Macronutrients */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Macronutrients</h2>
            
            <div className="space-y-6 mb-8">
              <MacroBar label="Carbs" value={dailyTotals.carbs} max={300} color="bg-green-500" />
              <MacroBar label="Fat" value={dailyTotals.fat} max={65} color="bg-yellow-500" />
              <MacroBar label="Protein" value={dailyTotals.protein} max={150} color="bg-purple-500" />
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-gray-700">Today's Totals</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Carbs</p>
                  <p className="text-xl font-bold text-green-500">{dailyTotals.carbs.toFixed(0)}g</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Fat</p>
                  <p className="text-xl font-bold text-yellow-500">{dailyTotals.fat.toFixed(0)}g</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Protein</p>
                  <p className="text-xl font-bold text-purple-500">{dailyTotals.protein.toFixed(0)}g</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Calories</p>
                  <p className="text-xl font-bold text-blue-500">{dailyTotals.calories.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column: Weekly Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Weekly Summary</h2>
            
            <div className="h-64 flex items-end space-x-3 mb-8">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${i === 3 ? 'bg-blue-600' : 'bg-blue-200'} rounded-t-sm`} 
                    style={{ height: `${20 + Math.random() * 80}%` }}
                  ></div>
                  <span className="text-sm mt-2 text-gray-500">{day}</span>
                </div>
              ))}
            </div>
            
            <h3 className="font-medium mb-3 text-gray-800">Recent Meals</h3>
            <div className="grid grid-cols-4 gap-4">
              {todaysLogs.length > 0 ? (
                todaysLogs.slice(0, 4).map((log) => (
                  <RecentMealThumbnail key={log._id} name={log.foodName} />
                ))
              ) : (
                <>
                  <RecentMealThumbnail name="Oatmeal" />
                  <RecentMealThumbnail name="Salad" />
                  <RecentMealThumbnail name="Chicken" />
                  <RecentMealThumbnail name="Yogurt" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Macronutrient Bar Component
interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

function MacroBar({ label, value, max, color }: MacroBarProps) {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-500">{value.toFixed(0)}g / {max}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
      </div>
    </div>
  );
}