'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';
import * as nutritionService from '@/services/nutritionService';
import NutritionNavigation from '@/components/nutrition/NutritionNavigation';

export default function FoodLogPage() {
  const [foodLogs, setFoodLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [totalNutrition, setTotalNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [nutritionGoals, setNutritionGoals] = useState({
    calorieGoal: 2000,
    proteinGoal: 50,
    carbsGoal: 250,
    fatGoal: 70
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch nutrition profile to get goals
    const fetchNutritionProfile = async () => {
      try {
        const profileData = await nutritionService.getNutritionProfile();
        setNutritionGoals({
          calorieGoal: profileData.calorieGoal,
          proteinGoal: profileData.proteinGoal,
          carbsGoal: profileData.carbsGoal,
          fatGoal: profileData.fatGoal
        });
      } catch (error) {
        console.error('Error fetching nutrition profile:', error);
      }
    };
    
    fetchNutritionProfile();
    fetchFoodLogs();
  }, [router, selectedDate]);

  const fetchFoodLogs = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, we would call an API endpoint to get food logs for the selected date
      // For now, we'll simulate a response with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockFoodLogs = [
        {
          _id: '1',
          foodName: 'Grilled Chicken Breast',
          portion: '4 oz (113g)',
          mealType: 'lunch',
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          createdAt: new Date(selectedDate).setHours(12, 30),
          category: 'Protein',
          mood: 'Energetic',
          hunger: 7,
          fullness: 8
        },
        {
          _id: '2',
          foodName: 'Brown Rice',
          portion: '1 cup cooked (195g)',
          mealType: 'lunch',
          calories: 216,
          protein: 5,
          carbs: 45,
          fat: 1.8,
          createdAt: new Date(selectedDate).setHours(12, 30),
          category: 'Grain',
          mood: 'Energetic',
          hunger: 7,
          fullness: 8
        },
        {
          _id: '3',
          foodName: 'Steamed Broccoli',
          portion: '1 cup (156g)',
          mealType: 'lunch',
          calories: 55,
          protein: 3.7,
          carbs: 11.2,
          fat: 0.6,
          createdAt: new Date(selectedDate).setHours(12, 30),
          category: 'Vegetable',
          mood: 'Energetic',
          hunger: 7,
          fullness: 8
        },
        {
          _id: '4',
          foodName: 'Greek Yogurt',
          portion: '1 cup (245g)',
          mealType: 'breakfast',
          calories: 150,
          protein: 20,
          carbs: 8,
          fat: 4,
          createdAt: new Date(selectedDate).setHours(8, 0),
          category: 'Dairy',
          mood: 'Sleepy',
          hunger: 8,
          fullness: 6
        },
        {
          _id: '5',
          foodName: 'Banana',
          portion: '1 medium (118g)',
          mealType: 'snack',
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.4,
          createdAt: new Date(selectedDate).setHours(15, 0),
          category: 'Fruit',
          mood: 'Hungry',
          hunger: 6,
          fullness: 4
        }
      ];
      
      setFoodLogs(mockFoodLogs);
      
      // Calculate total nutrition
      const totals = mockFoodLogs.reduce((acc, log) => {
        return {
          calories: acc.calories + log.calories,
          protein: acc.protein + log.protein,
          carbs: acc.carbs + log.carbs,
          fat: acc.fat + log.fat
        };
      }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
      
      setTotalNutrition(totals);
    } catch (error) {
      console.error('Error fetching food logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  const goToPreviousDay = () => {
    const previousDay = new Date(selectedDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setSelectedDate(previousDay);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🥗';
      case 'dinner':
        return '🍽️';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const groupFoodLogsByMealType = () => {
    const grouped: { [key: string]: any[] } = {};
    
    foodLogs.forEach(log => {
      if (!grouped[log.mealType]) {
        grouped[log.mealType] = [];
      }
      grouped[log.mealType].push(log);
    });
    
    // Sort meal types in a specific order
    const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    return Object.entries(grouped)
      .sort(([a], [b]) => mealOrder.indexOf(a) - mealOrder.indexOf(b))
      .map(([mealType, logs]) => ({
        mealType,
        logs,
        totalCalories: logs.reduce((sum, log) => sum + log.calories, 0)
      }));
  };

  const calculateNutritionPercentage = (value: number, goal: number) => {
    return Math.min(Math.round((value / goal) * 100), 100);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-indigo-800">Food Log</h1>
            <p className="text-gray-600">Track your daily food intake</p>
          </header>
          
          <NutritionNavigation />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <h2 className="text-xl font-semibold text-white mb-3 sm:mb-0">Food Log</h2>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={goToPreviousDay}
                        className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={goToToday}
                        className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition text-sm"
                      >
                        Today
                      </button>
                      
                      <button
                        onClick={goToNextDay}
                        className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">{formatDateForDisplay(selectedDate)}</h3>
                    
                    <div className="flex items-center space-x-4">
                      <input
                        type="date"
                        value={selectedDate.toISOString().split('T')[0]}
                        onChange={(e) => handleDateChange(new Date(e.target.value))}
                        className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      
                      <Link 
                        href="/nutrition/food-recognition"
                        className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : foodLogs.length > 0 ? (
                    <div className="space-y-6">
                      {groupFoodLogsByMealType().map((group) => (
                        <div key={group.mealType} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{getMealTypeIcon(group.mealType)}</span>
                              <h4 className="font-medium text-gray-800 capitalize">{group.mealType}</h4>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Total:</span>
                              <span className="ml-1 font-semibold">{group.totalCalories} cal</span>
                            </div>
                          </div>
                          
                          <div className="divide-y divide-gray-200">
                            {group.logs.map((log) => (
                              <div key={log._id} className="px-4 py-3 hover:bg-gray-50">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="font-medium text-gray-800">{log.foodName}</h5>
                                    <p className="text-sm text-gray-500">{log.portion} • {formatTime(log.createdAt)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-medium text-gray-800">{log.calories} cal</p>
                                    <p className="text-xs text-gray-500">P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">No Food Logs</h3>
                      <p className="text-gray-500 mb-6">You haven't logged any food for this date.</p>
                      <Link 
                        href="/nutrition/food-recognition"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Food
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4">
                  <h2 className="text-xl font-semibold text-white">Daily Summary</h2>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">Calories</h3>
                      <div className="text-sm">
                        <span className="font-medium">{totalNutrition.calories}</span>
                        <span className="text-gray-500"> / {nutritionGoals.calorieGoal}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full" 
                        style={{ width: `${calculateNutritionPercentage(totalNutrition.calories, nutritionGoals.calorieGoal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">Protein</h3>
                      <div className="text-sm">
                        <span className="font-medium">{totalNutrition.protein.toFixed(1)}g</span>
                        <span className="text-gray-500"> / {nutritionGoals.proteinGoal}g</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${calculateNutritionPercentage(totalNutrition.protein, nutritionGoals.proteinGoal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">Carbs</h3>
                      <div className="text-sm">
                        <span className="font-medium">{totalNutrition.carbs.toFixed(1)}g</span>
                        <span className="text-gray-500"> / {nutritionGoals.carbsGoal}g</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-500 h-2.5 rounded-full" 
                        style={{ width: `${calculateNutritionPercentage(totalNutrition.carbs, nutritionGoals.carbsGoal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-800">Fat</h3>
                      <div className="text-sm">
                        <span className="font-medium">{totalNutrition.fat.toFixed(1)}g</span>
                        <span className="text-gray-500"> / {nutritionGoals.fatGoal}g</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-500 h-2.5 rounded-full" 
                        style={{ width: `${calculateNutritionPercentage(totalNutrition.fat, nutritionGoals.fatGoal)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="font-medium text-gray-800 mb-3">Macronutrient Breakdown</h3>
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 relative">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          {/* Protein */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeDasharray={`${(totalNutrition.protein * 4 / (totalNutrition.calories || 1)) * 100}, 100`}
                            strokeLinecap="round"
                          />
                          {/* Carbs */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeDasharray={`${(totalNutrition.carbs * 4 / (totalNutrition.calories || 1)) * 100}, 100`}
                            strokeDashoffset={`${-1 * (totalNutrition.protein * 4 / (totalNutrition.calories || 1)) * 100}`}
                            strokeLinecap="round"
                          />
                          {/* Fat */}
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#eab308"
                            strokeWidth="3"
                            strokeDasharray={`${(totalNutrition.fat * 9 / (totalNutrition.calories || 1)) * 100}, 100`}
                            strokeDashoffset={`${-1 * ((totalNutrition.protein * 4 + totalNutrition.carbs * 4) / (totalNutrition.calories || 1)) * 100}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <span className="text-2xl font-bold">{totalNutrition.calories}</span>
                          <span className="text-xs text-gray-500">calories</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center mt-4 space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-xs text-gray-600">Protein</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                        <span className="text-xs text-gray-600">Carbs</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                        <span className="text-xs text-gray-600">Fat</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Link 
                      href="/nutrition/food-recognition"
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Log Food
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}