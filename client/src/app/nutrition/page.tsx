'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

// --- Monthly Calendar Component ---
interface DayData {
  date: Date;
  percentage: number;
}

const MonthlyCalendarView = ({ days }: { days: DayData[] }) => {
  // Get current month days
  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create array of dates for current month
    const datesArray: Date[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      datesArray.push(new Date(year, month, i));
    }
    return datesArray;
  };
  
  const monthDays = getDaysInMonth();
  
  // Get color based on percentage
  const getColorClass = (date: Date) => {
    const dayData = days.find(d => 
      d.date.getDate() === date.getDate() && 
      d.date.getMonth() === date.getMonth() && 
      d.date.getFullYear() === date.getFullYear()
    );
    
    if (!dayData) return "bg-gray-100";
    
    const percentage = dayData.percentage;
    if (percentage >= 95) return "bg-green-600";
    if (percentage >= 60) return "bg-green-400";
    if (percentage >= 20) return "bg-yellow-400";
    return "bg-red-400";
  };
  
  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="text-xs text-center font-medium text-gray-500">
          {day}
        </div>
      ))}
      
      {/* Empty cells for days before the 1st of the month */}
      {Array.from({ length: monthDays[0].getDay() }).map((_, index) => (
        <div key={`empty-${index}`} className="h-8"></div>
      ))}
      
      {/* Calendar days */}
      {monthDays.map((date) => (
        <div 
          key={date.toString()} 
          className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${getColorClass(date)} ${
            isToday(date) ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {date.getDate()}
        </div>
      ))}
    </div>
  );
};

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
      
      {/* Fill Effect */}
      <div 
        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-300 z-0 rounded-lg opacity-70"
        style={{ 
          height: `${fillHeight}%`,
          transition: 'height 1s ease-in-out',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
        }}
      ></div>
      
      {/* Percentage Text */}
      <div className="absolute bottom-0 left-0 right-0 text-center mb-4 z-20">
        <span className="bg-white/80 text-blue-600 font-bold px-2 py-1 rounded-full text-sm">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

// --- Macro Bar Component ---
const MacroBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-500">{value.toFixed(0)}g / {max}g</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

export default function NutritionHome() {
  // Add CSS for the body visualizer height
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .h-112 {
        height: 28rem;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  // User data
  const [todaysLogs, setTodaysLogs] = useState<FoodLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [monthlyData, setMonthlyData] = useState<DayData[]>([]);
  const [goalInput, setGoalInput] = useState<number>(2000);
  
  // Chat state
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{text: string, isUser: boolean}[]>([
    {text: "Hello! How can I assist you with your nutrition today?", isUser: false}
  ]);

  // Food logging state
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  
  // Image analysis state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiText, setAiText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Recipe state
  const [ingredients, setIngredients] = useState('');
  const [showIngredientInput, setShowIngredientInput] = useState(false);

  const getAuthHeaders = useCallback(() => ({ 
    headers: { Authorization: `Bearer ${localStorage.getItem('rats_token')}` } 
  }), []);

  const dailyTotals = useMemo(() => {
    return todaysLogs.reduce((acc, log) => {
      acc.calories += log.calories || 0;
      acc.protein += log.protein || 0;
      acc.carbs += log.carbs || 0;
      acc.fat += log.fat || 0;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  }, [todaysLogs]);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, foodRes] = await Promise.all([
        axios.get('http://localhost:5001/api/users/profile/me', getAuthHeaders()),
        axios.get('http://localhost:5001/api/food/today', getAuthHeaders())
      ]);
      setUserProfile(profileRes.data);
      setTodaysLogs(foodRes.data);
      
      // Initialize goal input with user's current goal
      if (profileRes.data.dailyCalorieGoal) {
        setGoalInput(profileRes.data.dailyCalorieGoal);
      }
      
      // Generate some sample monthly data (in a real app, this would come from the backend)
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const sampleData: DayData[] = [];
      
      for (let i = 1; i <= today.getDate(); i++) {
        // Random percentage between 0 and 100 for past days
        const percentage = Math.floor(Math.random() * 101);
        sampleData.push({
          date: new Date(today.getFullYear(), today.getMonth(), i),
          percentage
        });
      }
      
      // Calculate today's percentage based on the current logs
      const currentCalories = foodRes.data.reduce((total: number, log: FoodLog) => total + (log.calories || 0), 0);
      const goalCalories = profileRes.data.dailyCalorieGoal || 2000;
      const todayPercentage = (currentCalories / goalCalories) * 100;
      
      // Today's actual percentage
      sampleData[today.getDate() - 1] = {
        date: today,
        percentage: todayPercentage
      };
      
      setMonthlyData(sampleData);
    } catch (error) { 
      console.error('Failed to fetch data:', error); 
    }
  }, [getAuthHeaders]);
  
  const handleUpdateGoal = async () => {
    if (!goalInput || goalInput <= 0) {
      alert('Please enter a valid calorie goal');
      return;
    }
    
    try {
      await axios.put(
        'http://localhost:5001/api/users/goal',
        { dailyCalorieGoal: goalInput },
        getAuthHeaders()
      );
      
      // Update local state
      setUserProfile(prev => prev ? {...prev, dailyCalorieGoal: goalInput} : null);
      alert('Daily calorie goal updated successfully!');
    } catch (error: any) {
      console.error('Failed to update goal:', error);
      alert(error.response?.data?.message || 'Failed to update goal. Please try again.');
    }
  };

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, {text: chatMessage, isUser: true}]);
    
    // Simulate AI response (in a real app, this would call your backend)
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        text: "I'll help you with that! What specific nutrition information would you like to know?", 
        isUser: false
      }]);
    }, 1000);
    
    setChatMessage('');
  };

  const handleQuickAction = (action: string) => {
    setChatMessages(prev => [...prev, {text: action, isUser: true}]);
    
    // Simulate AI response based on the action
    setTimeout(() => {
      let response = "";
      switch(action) {
        case "🔘 Meal Suggestions":
          response = "Based on your profile, I recommend trying these meals today: 1) Grilled chicken with quinoa and vegetables, 2) Greek yogurt with berries and nuts, 3) Salmon with sweet potato and asparagus.";
          break;
        case "🔘 Nutrient Advice":
          response = "Your protein intake is a bit low today. Try adding more lean protein sources like chicken, fish, tofu, or legumes to your meals.";
          break;
        case "🔘 Track Intake":
          response = "So far today you've consumed " + dailyTotals.calories.toFixed(0) + " calories, which is " + 
            Math.round((dailyTotals.calories / (userProfile?.dailyCalorieGoal || 2000)) * 100) + "% of your daily goal.";
          break;
        case "🔘 Generate Recipe":
          setShowIngredientInput(true);
          response = "I'd be happy to suggest a recipe! What ingredients do you have available?";
          break;
        default:
          response = "I'll help you with that! What specific information would you like?";
      }
      setChatMessages(prev => [...prev, {text: response, isUser: false}]);
    }, 1000);
  };
  
  const handleIngredientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    
    // Add user message to chat
    setChatMessages(prev => [...prev, {text: `Ingredients I have: ${ingredients}`, isUser: true}]);
    
    // Simulate AI response with recipe
    setTimeout(() => {
      const response = `Here's a recipe you can make with ${ingredients}:\n\n` +
        "Quick Stir Fry\n\n" +
        "1. Heat oil in a pan over medium-high heat\n" +
        "2. Add your protein and cook until browned\n" +
        "3. Add vegetables and stir fry for 3-5 minutes\n" +
        "4. Add sauce (soy sauce, garlic, ginger) and cook for 1 more minute\n" +
        "5. Serve over rice or noodles\n\n" +
        "Enjoy your meal! This should take about 15-20 minutes to prepare.";
      
      setChatMessages(prev => [...prev, {text: response, isUser: false}]);
    }, 1500);
    
    setIngredients('');
    setShowIngredientInput(false);
  };

  const handleLogFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!foodName || calories === '') {
      alert('Food name and calories are required.');
      return;
    }
    
    try {
      // Ensure all values are properly converted to numbers
      const caloriesNum = Number(calories);
      const proteinNum = protein !== '' ? Number(protein) : 0;
      const carbsNum = carbs !== '' ? Number(carbs) : 0;
      const fatNum = fat !== '' ? Number(fat) : 0;
      
      // Validate that calories is a valid number
      if (isNaN(caloriesNum)) {
        alert('Calories must be a valid number.');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5001/api/food', 
        {
          foodName, 
          calories: caloriesNum, 
          protein: proteinNum, 
          carbs: carbsNum, 
          fat: fatNum,
        }, 
        getAuthHeaders()
      );
      
      console.log('Food log response:', response.data);
      await fetchData();
      
      // Reset form
      setFoodName(''); 
      setCalories(''); 
      setProtein(''); 
      setCarbs(''); 
      setFat('');
      setImageFile(null); 
      setImagePreview(null); 
      setAiText('');
      
      alert('Food logged successfully!');
    } catch (error: any) { 
      console.error('Error logging food:', error.response?.data || error.message);
      
      // More detailed error handling
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        router.push('/login');
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Failed to log food. Please try again.');
      }
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

  if (!isMounted) {
    return null;
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        
        <div className="grid grid-cols-3 gap-6">
          {/* Left Section: Log Your Meal */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-800">🍽️ Log Your Meal</h2>
            
            {/* Text Analysis */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-gray-700">✏️ Log with Text</h3>
              <form onSubmit={handleAnalyzeText} className="space-y-3">
                <textarea 
                  value={aiText} 
                  onChange={(e) => setAiText(e.target.value)} 
                  placeholder="e.g., '100g chicken breast and a side salad'" 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                  rows={3}
                />
                <button 
                  type="submit" 
                  disabled={isAiLoading} 
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {isAiLoading ? 'Analyzing...' : 'Analyze Text'}
                </button>
              </form>
            </div>
            
            {/* Photo Analysis */}
            <div className="mb-6">
              <h3 className="font-medium mb-2 text-gray-700">📷 Log with Photo</h3>
              <input 
                type="file" 
                id="imageUpload" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden"
              />
              <div className="flex gap-2">
                <label 
                  htmlFor="imageUpload" 
                  className="flex-1 text-center block cursor-pointer bg-blue-50 text-blue-600 font-medium py-2 rounded-lg hover:bg-blue-100 transition"
                >
                  Choose Image
                </label>
                {imageFile && (
                  <button 
                    onClick={handleAnalyzeImage} 
                    disabled={isAiLoading} 
                    className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Analyze'}
                  </button>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2 flex justify-center items-center h-24 w-full bg-gray-50 rounded-lg border border-gray-200">
                  <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-lg" />
                </div>
              )}
            </div>
            
            {/* Manual Entry */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">📋 Log Manually</h3>
              <form onSubmit={handleLogFood} className="space-y-3">
                <input 
                  type="text" 
                  id="foodName" 
                  value={foodName} 
                  onChange={e => setFoodName(e.target.value)} 
                  placeholder="Food name"
                  required 
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    id="calories" 
                    value={calories} 
                    onChange={e => setCalories(Number(e.target.value))} 
                    placeholder="Calories"
                    required 
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input 
                    type="number" 
                    id="protein" 
                    value={protein} 
                    onChange={e => setProtein(Number(e.target.value))} 
                    placeholder="Protein (g)"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input 
                    type="number" 
                    id="carbs" 
                    value={carbs} 
                    onChange={e => setCarbs(Number(e.target.value))} 
                    placeholder="Carbs (g)"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input 
                    type="number" 
                    id="fat" 
                    value={fat} 
                    onChange={e => setFat(Number(e.target.value))} 
                    placeholder="Fat (g)"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Log Food
                </button>
              </form>
            </div>
          </div>
          
          {/* Center Section: AI Coach */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-gray-800">🤖 AI Nutrition Coach</h2>
            <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto h-64">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`${msg.isUser ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-blue-100 text-gray-800'} 
                    p-3 rounded-lg max-w-xs mb-2`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.text}</p>
                </div>
              ))}
            </div>
            
            {showIngredientInput ? (
              <form onSubmit={handleIngredientSubmit} className="mb-4">
                <div className="flex flex-col space-y-2">
                  <input 
                    type="text" 
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="Enter ingredients (e.g., chicken, rice, broccoli)" 
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit Ingredients
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 mb-4">
                <button 
                  onClick={() => handleQuickAction("🔘 Meal Suggestions")}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  🔘 Meal Suggestions
                </button>
                <button 
                  onClick={() => handleQuickAction("🔘 Nutrient Advice")}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  🔘 Nutrient Advice
                </button>
                <button 
                  onClick={() => handleQuickAction("🔘 Track Intake")}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  🔘 Track Intake
                </button>
                <button 
                  onClick={() => handleQuickAction("🔘 Generate Recipe")}
                  className="w-full py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  🔘 Generate Recipe
                </button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="flex">
              <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type message here" 
                className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </form>
          </div>
          
          {/* Right Section: Progress Overview */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📈 Progress Overview</h2>
              <div className="relative group">
                <div className="bg-orange-500/10 text-orange-500 font-bold px-3 py-1 rounded-full flex items-center cursor-help">
                  {userProfile?.streak || 0} <span className="ml-1 text-lg">🔥</span>
                </div>
                <div className="absolute right-0 w-64 bg-white p-3 rounded-lg shadow-lg text-sm text-gray-700 invisible group-hover:visible z-10 border border-gray-200">
                  <p className="font-medium mb-1">Streak Counter</p>
                  <p>Reach your daily calorie goal to increase your streak! If you miss a day, your streak resets to 0.</p>
                </div>
              </div>
            </div>
            
            {/* Body Visualizer */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center">
                <BodyVisualizer percentage={(dailyTotals.calories / (userProfile?.dailyCalorieGoal || 2000)) * 100} />
                <p className="mt-4 text-center font-bold text-2xl">
                  {dailyTotals.calories.toFixed(0)} <span className="text-gray-500 text-lg">/ {userProfile?.dailyCalorieGoal || 2000} cal</span>
                </p>
                {userProfile?.dailyCalorieGoal && (
                  <div className="mt-3 w-full max-w-xs">
                    {dailyTotals.calories >= userProfile.dailyCalorieGoal ? (
                      <div className="bg-green-100 border border-green-200 rounded-lg p-2 flex items-center">
                        <div className="bg-green-500 rounded-full p-1 mr-2">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-800 font-medium text-sm">Daily Goal Achieved!</p>
                          <p className="text-green-600 text-xs">Your streak will increase today 🔥</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-1 flex justify-between items-center">
                          <p className="text-gray-600 text-xs font-medium">Streak Progress</p>
                          <p className="text-gray-600 text-xs font-medium">
                            {Math.round((dailyTotals.calories / userProfile.dailyCalorieGoal) * 100)}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-orange-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round((dailyTotals.calories / userProfile.dailyCalorieGoal) * 100))}%` }}
                          ></div>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-lg p-2 flex items-center">
                          <div className="bg-orange-500 rounded-full p-1 mr-2 flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </div>
                          <div>
                            <p className="text-orange-800 font-medium text-sm">
                              {Math.round(userProfile.dailyCalorieGoal - dailyTotals.calories)} calories to go
                            </p>
                            <p className="text-orange-600 text-xs">Log more food to maintain your streak!</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="mt-3 flex items-center space-x-2">
                  <input 
                    type="number" 
                    value={goalInput} 
                    onChange={(e) => setGoalInput(Number(e.target.value))}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    placeholder="Calories"
                  />
                  <button 
                    onClick={handleUpdateGoal}
                    className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Set Goal
                  </button>
                </div>
              </div>
            </div>
            
            {/* Macronutrient Bars */}
            <div className="space-y-4 mb-6">
              <MacroBar label="Carbs" value={dailyTotals.carbs} max={300} color="bg-green-500" />
              <MacroBar label="Fat" value={dailyTotals.fat} max={65} color="bg-yellow-500" />
              <MacroBar label="Protein" value={dailyTotals.protein} max={150} color="bg-purple-500" />
            </div>
            
            {/* Recent Meals */}
            <h3 className="font-medium mb-3 text-gray-800">Recent Meals</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {todaysLogs.length > 0 ? (
                todaysLogs.map((log) => (
                  <div key={log._id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-medium">{log.foodName}</p>
                      <p className="text-sm text-gray-500">
                        {log.calories} kcal | {log.protein}g P | {log.carbs}g C | {log.fat}g F
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No food logs for today yet.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Monthly Nutrition Calendar */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">📊 Monthly Nutrition Calendar</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-4 text-gray-800">Calorie Tracking Calendar</h3>
                <MonthlyCalendarView days={monthlyData} />
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-400 rounded-sm mr-2"></div>
                    <span>&lt;20%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-400 rounded-sm mr-2"></div>
                    <span>20-60%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-400 rounded-sm mr-2"></div>
                    <span>60-95%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-sm mr-2"></div>
                    <span>&gt;95%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg border border-gray-200 h-full">
                <h3 className="font-medium mb-3 text-gray-800">Today's Stats</h3>
                <div className="space-y-2">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Calories</p>
                    <p className="text-xl font-bold text-blue-600">{dailyTotals.calories.toFixed(0)} kcal</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Total Protein</p>
                    <p className="text-xl font-bold text-green-600">{dailyTotals.protein.toFixed(0)}g</p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-500">Meals Logged</p>
                    <p className="text-xl font-bold text-yellow-600">{todaysLogs.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}