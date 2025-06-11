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

export default function NutritionLog() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  // Food logging state
  const [todaysLogs, setTodaysLogs] = useState<FoodLog[]>([]);
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
  
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = useCallback(() => ({ 
    headers: { Authorization: `Bearer ${localStorage.getItem('rats_token')}` } 
  }), []);

  const fetchTodaysLogs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/food/today', getAuthHeaders());
      setTodaysLogs(response.data);
    } catch (error) { 
      console.error('Failed to fetch food logs:', error); 
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
        await fetchTodaysLogs();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setIsLoading(false);
      }
    };
    
    initialLoad();
  }, [router, fetchTodaysLogs]);

  const handleLogFood = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!foodName || calories === '') return;
    
    try {
      await axios.post('http://localhost:5001/api/food', {
        foodName, 
        calories, 
        protein: protein || 0, 
        carbs: carbs || 0, 
        fat: fat || 0,
      }, getAuthHeaders());
      
      await fetchTodaysLogs();
      
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
    } catch (error) { 
      alert('Failed to log food.'); 
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
      {/* Desktop Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <NavLink href="/nutrition" label="🏠 Home" isActive={false} />
              <NavLink href="/nutrition/chat" label="💬 Chat" isActive={false} />
              <NavLink href="/nutrition/log" label="📝 Log" isActive={true} />
              <NavLink href="/nutrition/progress" label="📊 Progress" isActive={false} />
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
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column: Photo Analysis */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📷 Log with Photo</h2>
            <input 
              type="file" 
              id="imageUpload" 
              accept="image/*" 
              onChange={handleImageChange} 
              className="hidden"
            />
            <label 
              htmlFor="imageUpload" 
              className="w-full text-center block cursor-pointer bg-blue-50 text-blue-600 font-medium py-3 rounded-lg hover:bg-blue-100 transition"
            >
              Choose Image
            </label>
            <div className="flex justify-center items-center h-48 w-full bg-gray-50 rounded-lg mt-4 border border-gray-200">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-lg" />
              ) : (
                <span className="text-gray-400">Preview</span>
              )}
            </div>
            {imagePreview && (
              <button 
                onClick={handleAnalyzeImage} 
                disabled={isAiLoading} 
                className="mt-4 w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isAiLoading ? 'Analyzing...' : 'Analyze Photo'}
              </button>
            )}
          </div>
          
          {/* Center Column: Text Analysis */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">✏️ Log with Text</h2>
            <form onSubmit={handleAnalyzeText} className="h-full flex flex-col">
              <textarea 
                value={aiText} 
                onChange={(e) => setAiText(e.target.value)} 
                placeholder="e.g., '100g chicken breast and a side salad'" 
                className="w-full flex-grow p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" 
                rows={6}
              />
              <button 
                type="submit" 
                disabled={isAiLoading} 
                className="mt-4 w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                {isAiLoading ? 'Analyzing...' : 'Analyze Text'}
              </button>
            </form>
          </div>
          
          {/* Right Column: Manual Entry & Today's Logs */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📋 Log Manually</h2>
            <form onSubmit={handleLogFood}>
              <div className="mb-3">
                <label htmlFor="foodName" className="text-sm font-medium text-gray-700">Food Name*</label>
                <input 
                  type="text" 
                  id="foodName" 
                  value={foodName} 
                  onChange={e => setFoodName(e.target.value)} 
                  required 
                  className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="calories" className="text-sm text-gray-700">Calories*</label>
                  <input 
                    type="number" 
                    id="calories" 
                    value={calories} 
                    onChange={e => setCalories(Number(e.target.value))} 
                    required 
                    className="mt-1 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="protein" className="text-sm text-gray-700">Protein (g)</label>
                  <input 
                    type="number" 
                    id="protein" 
                    value={protein} 
                    onChange={e => setProtein(Number(e.target.value))} 
                    className="mt-1 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="carbs" className="text-sm text-gray-700">Carbs (g)</label>
                  <input 
                    type="number" 
                    id="carbs" 
                    value={carbs} 
                    onChange={e => setCarbs(Number(e.target.value))} 
                    className="mt-1 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="fat" className="text-sm text-gray-700">Fat (g)</label>
                  <input 
                    type="number" 
                    id="fat" 
                    value={fat} 
                    onChange={e => setFat(Number(e.target.value))} 
                    className="mt-1 w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Log Food
              </button>
            </form>
            
            <div className="mt-6">
              <h3 className="font-medium mb-3 text-gray-800">Today's Food Logs</h3>
              {todaysLogs.length === 0 ? (
                <p className="text-gray-500 text-sm">No food logs for today yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {todaysLogs.map((log) => (
                    <div key={log._id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg border border-gray-100">
                      <div>
                        <p className="font-medium">{log.foodName}</p>
                        <p className="text-sm text-gray-500">
                          {log.calories} kcal | {log.protein}g P | {log.carbs}g C | {log.fat}g F
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function CameraIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SearchIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}