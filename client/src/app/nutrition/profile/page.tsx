'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import * as nutritionService from '@/services/nutritionService';
import NutritionNavigation from '@/components/nutrition/NutritionNavigation';
import NutritionProfileSetup from '@/components/nutrition/NutritionProfileSetup';

export default function NutritionProfilePage() {
  const [nutritionProfile, setNutritionProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Fetch nutrition profile
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await nutritionService.getNutritionProfile();
        setNutritionProfile(profileData);
      } catch (error: any) {
        console.error('Error fetching nutrition profile:', error);
        // If 404, profile doesn't exist yet
        if (error.response && error.response.status === 404) {
          setIsEditing(true);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [router]);

  const handleProfileUpdate = async (profileData: any) => {
    try {
      setIsLoading(true);
      const updatedProfile = await nutritionService.createOrUpdateProfile(profileData);
      setNutritionProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating nutrition profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </ClientOnly>
    );
  }

  if (isEditing || !nutritionProfile) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-indigo-800">Nutrition Profile</h1>
              <p className="text-gray-600">Set up your nutrition preferences and goals</p>
            </header>
            
            <NutritionNavigation />
            
            <div className="mt-6">
              <NutritionProfileSetup 
                onSubmit={handleProfileUpdate} 
                initialData={nutritionProfile}
              />
            </div>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-indigo-800">Nutrition Profile</h1>
            <p className="text-gray-600">Your nutrition preferences and goals</p>
          </header>
          
          <NutritionNavigation />
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Profile Details</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
              >
                Edit Profile
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{nutritionProfile.weight} kg</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Height</p>
                      <p className="font-medium">{nutritionProfile.height} cm</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Activity Level</p>
                      <p className="font-medium capitalize">{nutritionProfile.activityLevel.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Nutrition Goals</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Daily Calorie Goal</p>
                      <p className="font-medium">{nutritionProfile.calorieGoal} calories</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Protein Goal</p>
                      <p className="font-medium">{nutritionProfile.proteinGoal} g</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Carbs Goal</p>
                      <p className="font-medium">{nutritionProfile.carbsGoal} g</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Fat Goal</p>
                      <p className="font-medium">{nutritionProfile.fatGoal} g</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dietary Preferences</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Diet Type</p>
                      <p className="font-medium capitalize">{nutritionProfile.dietType}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Cuisine Preferences</p>
                      {nutritionProfile.cuisinePreferences && nutritionProfile.cuisinePreferences.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {nutritionProfile.cuisinePreferences.map((cuisine: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                              {cuisine}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No preferences set</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Allergies</p>
                      {nutritionProfile.allergies && nutritionProfile.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {nutritionProfile.allergies.map((allergy: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No allergies</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Intolerances</p>
                      {nutritionProfile.intolerances && nutritionProfile.intolerances.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {nutritionProfile.intolerances.map((intolerance: string, index: number) => (
                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              {intolerance}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No intolerances</p>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mt-6 mb-4">Personalization</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Meal Size Preference</p>
                      <p className="font-medium capitalize">{nutritionProfile.mealSizePreference.replace('_', ' ')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Budget Level</p>
                      <p className="font-medium capitalize">{nutritionProfile.budgetLevel}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Cooking Skill</p>
                      <p className="font-medium capitalize">{nutritionProfile.cookingSkill}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Available Cooking Time</p>
                      <p className="font-medium capitalize">{nutritionProfile.cookingTime}</p>
                    </div>
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