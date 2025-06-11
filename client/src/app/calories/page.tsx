'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import BadgeNotification from '@/components/BadgeNotification';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface FoodLog { _id: string; foodName: string; calories: number; protein: number; carbs: number; fat: number; createdAt: string; }
interface UserProfile { dailyCalorieGoal: number; streak: number; username: string; }
interface LeaderboardEntry { _id: string; username: string; streak: number; }
interface Badge { name: string; description: string; icon: string; }

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

export default function CaloriesPage() {
  // --- STATE MANAGEMENT ---
  const [todaysLogs, setTodaysLogs] = useState<FoodLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [goalInput, setGoalInput] = useState<number | ''>('');
  
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiText, setAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => ({ 
    headers: { Authorization: `Bearer ${localStorage.getItem('rats_token')}` } 
  }), []);

  const refetchData = useCallback(async () => {
    try {
      const [profileRes, foodRes, leaderboardRes] = await Promise.all([
        axios.get('http://localhost:5001/api/users/profile/me', getAuthHeaders()),
        axios.get('http://localhost:5001/api/food/today', getAuthHeaders()),
        axios.get('http://localhost:5001/api/food/leaderboard', getAuthHeaders())
      ]);
      setUserProfile(profileRes.data);
      setTodaysLogs(foodRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) { 
      console.error('Failed to refetch data:', error); 
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const initialLoad = async () => {
      // Check if user is logged in
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
        
        setIsLoading(true);
        await refetchData();
        setIsLoading(false);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('rats_token');
        router.push('/login');
      }
    }
    initialLoad();
  }, [router, refetchData]);

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

  const handleLogFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!foodName || calories === '') return;
    try {
      const response = await axios.post('http://localhost:5001/api/food', {
        foodName, calories, protein: protein || 0, carbs: carbs || 0, fat: fat || 0,
      }, getAuthHeaders());
      
      const { newBadges } = response.data;
      if (newBadges && newBadges.length > 0) {
        setNewlyEarnedBadge(newBadges[0]);
      }
      
      await refetchData();
      
      setFoodName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      setImageFile(null); setImagePreview(null); setAiText('');
    } catch (error) { 
      alert('Failed to log food.'); 
    }
  };

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
  
  const populateFormWithAI = (data: any) => {
    setFoodName(data.foodName || 'AI Analyzed Meal');
    setCalories(data.calories || '');
    setProtein(data.protein || '');
    setCarbs(data.carbs || '');
    setFat(data.fat || '');
    alert("AI analysis complete! Please review and click 'Log Food' to save.");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { 
      setImageFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;
    setIsAiLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      try {
        const response = await axios.post(
          'http://localhost:5001/api/ai/analyze-image', 
          { image: base64Image }, 
          getAuthHeaders()
        );
        populateFormWithAI(response.data);
      } catch (error: any) { 
        alert(`AI analysis failed: ${error.response?.data?.message || 'Please try again.'}`); 
      } finally { 
        setIsAiLoading(false); 
      }
    };
  };

  const handleAnalyzeText = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aiText.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5001/api/ai/analyze-text', 
        { text: aiText }, 
        getAuthHeaders()
      );
      populateFormWithAI(response.data);
    } catch (error: any) { 
      alert(`AI analysis failed: ${error.response?.data?.message || 'Please try again.'}`); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading Your Sphere...</div>;
  }

  return (
    <ClientOnly>
      <div 
        className="min-h-screen bg-cover bg-center relative overflow-hidden"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        {newlyEarnedBadge && (
          <BadgeNotification 
            badge={newlyEarnedBadge} 
            onClose={() => setNewlyEarnedBadge(null)} 
          />
        )}
        
        {/* Shiny Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine"></div>
        
        <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* --- UPDATED LEFT COLUMN: LEADERBOARD --- */}
            <div className="lg:col-span-1 bg-white/2 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg -ml-4 overflow-y-auto" 
                 style={{ height: '400px', width: '90%' }}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <span className="text-yellow-400 mr-2 text-2xl">🏆</span> Community Leaders
              </h2>
              <ul className="space-y-3">
                {leaderboard.map((user, index) => (
                  <li key={user._id} className={`flex items-center p-3 rounded-lg ${user.username === userProfile?.username ? 'bg-blue-500/10' : ''}`}>
                    <span className="font-bold text-gray-400 text-lg w-8">{index + 1}.</span>
                    <span className="font-semibold text-white text-lg flex-grow">{user.username}</span>
                    <span className="font-bold text-orange-400 text-lg flex items-center">
                      {user.streak} <span className="ml-1 text-xl">🔥</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- CENTER COLUMN: VISUALIZER & GOAL --- */}
            <div className="lg:col-span-1 bg-white/2 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-lg flex flex-col items-center">
              <div className="w-full flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Daily Progress</h2>
                <div className="bg-orange-500/10 text-orange-400 font-bold px-3 py-1 rounded-full flex items-center">
                  {userProfile?.streak || 0} <span className="ml-1 text-lg">🔥</span>
                </div>
              </div>
              <div className="my-4">
                <BodyVisualizer percentage={(dailyTotals.calories / (userProfile?.dailyCalorieGoal || 2000)) * 100} />
              </div>
              <p className="font-bold text-4xl text-white">{dailyTotals.calories.toFixed(0)} <span className="text-gray-400 text-xl">/ {userProfile?.dailyCalorieGoal} kcal</span></p>
              <div className="mt-6 w-full">
                <label htmlFor="goal" className="block text-sm font-medium text-gray-300 text-center">Set Your Daily Goal</label>
                <div className="mt-1 flex gap-2">
                  <input 
                    type="number" 
                    id="goal" 
                    value={goalInput} 
                    onChange={e => setGoalInput(Number(e.target.value))} 
                    className="block w-full px-3 py-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button 
                    onClick={handleUpdateGoal} 
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
            
            {/* --- RIGHT COLUMN: LOGGING TOOLS --- */}
            <div className="lg:col-span-1 space-y-6">
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-white/2 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-3">Log with Photo</h3>
                  <input 
                    type="file" 
                    id="imageUpload" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden"
                  />
                  <label 
                    htmlFor="imageUpload" 
                    className="w-full text-center block cursor-pointer bg-white/10 text-gray-300 font-semibold py-2 rounded-lg hover:bg-white/20 transition"
                  >
                    Choose Image
                  </label>
                  <div className="flex justify-center items-center h-32 w-full bg-white/5 rounded-lg mt-3 border border-white/10">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-lg" />
                    ) : (
                      <span className="text-gray-400 text-sm">Preview</span>
                    )}
                  </div>
                  {imagePreview && (
                    <button 
                      onClick={handleAnalyzeImage} 
                      disabled={isAiLoading} 
                      className="mt-3 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500/50"
                    >
                      {isAiLoading ? 'Analyzing...' : 'Analyze Photo'}
                    </button>
                  )}
                </div>
                
                <div className="bg-white/2 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-3">Log with Text</h3>
                  <form onSubmit={handleAnalyzeText} className="h-full flex flex-col justify-between">
                    <textarea 
                      value={aiText} 
                      onChange={(e) => setAiText(e.target.value)} 
                      placeholder="e.g., '100g chicken breast and a side salad'" 
                      className="w-full flex-grow p-3 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                      rows={4}
                    />
                    <button 
                      type="submit" 
                      disabled={isAiLoading} 
                      className="mt-3 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-500/50"
                    >
                      {isAiLoading ? 'Analyzing...' : 'Analyze Text'}
                    </button>
                  </form>
                </div>
                
                <div className="bg-white/2 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-3">Confirm & Log Manually</h3>
                  <form onSubmit={handleLogFood}>
                    <div className="mb-3">
                      <label htmlFor="foodName" className="text-sm font-medium text-gray-300">Food Name*</label>
                      <input 
                        type="text" 
                        id="foodName" 
                        value={foodName} 
                        onChange={e => setFoodName(e.target.value)} 
                        required 
                        className="mt-1 block w-full px-3 py-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label htmlFor="calories" className="text-sm text-gray-300">Calories*</label>
                        <input 
                          type="number" 
                          id="calories" 
                          value={calories} 
                          onChange={e => setCalories(Number(e.target.value))} 
                          required 
                          className="mt-1 w-full p-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label htmlFor="protein" className="text-sm text-gray-300">Protein (g)</label>
                        <input 
                          type="number" 
                          id="protein" 
                          value={protein} 
                          onChange={e => setProtein(Number(e.target.value))} 
                          className="mt-1 w-full p-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label htmlFor="carbs" className="text-sm text-gray-300">Carbs (g)</label>
                        <input 
                          type="number" 
                          id="carbs" 
                          value={carbs} 
                          onChange={e => setCarbs(Number(e.target.value))} 
                          className="mt-1 w-full p-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label htmlFor="fat" className="text-sm text-gray-300">Fat (g)</label>
                        <input 
                          type="number" 
                          id="fat" 
                          value={fat} 
                          onChange={e => setFat(Number(e.target.value))} 
                          className="mt-1 w-full p-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                    <div className="text-right mt-4">
                      <button 
                        type="submit" 
                        className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Log Food
                      </button>
                    </div>
                  </form>
                </div>
                
                {/* --- FOOD LOGS SECTION --- */}
                <div className="bg-white/2 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-3">Today's Food Logs</h3>
                  {todaysLogs.length === 0 ? (
                    <p className="text-gray-400 text-sm">No food logs for today yet.</p>
                  ) : (
                    <ul className="space-y-3 max-h-48 overflow-y-auto">
                      {todaysLogs.map((log) => (
                        <li key={log._id} className="flex items-center p-2 rounded-lg bg-white/5">
                          <span className="font-semibold text-white flex-grow">{log.foodName}</span>
                          <span className="text-gray-300 text-sm">
                            {log.calories} kcal | {log.protein}g P | {log.carbs}g C | {log.fat}g F
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style jsx global>{`
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shine {
            animation: shine 5s infinite linear;
          }
        `}</style>
      </div>
    </ClientOnly>
  );
}