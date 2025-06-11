// client/src/components/nutrition/NutritionProfileSetup.tsx

import { useState } from 'react';

interface NutritionProfileSetupProps {
  onSubmit: (profileData: any) => void;
}

export default function NutritionProfileSetup({ onSubmit }: NutritionProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic nutrition goals
    calorieGoal: 2000,
    proteinGoal: 50,
    carbsGoal: 250,
    fatGoal: 70,
    
    // Dietary preferences
    dietType: 'standard',
    cuisinePreferences: [] as string[],
    allergies: [] as string[],
    intolerances: [] as string[],
    dislikedFoods: [] as string[],
    favoriteFoods: [] as string[],
    
    // Health metrics
    weight: 70,
    height: 170,
    activityLevel: 'moderately_active',
    healthGoals: ['maintain weight'] as string[],
    
    // Personalization
    mealSizePreference: 'medium_regular',
    budgetLevel: 'moderate',
    cookingSkill: 'intermediate',
    cookingTime: 'moderate',
    
    // Regional customization
    region: 'United States',
    localFoodPreferences: [] as string[]
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };
  
  const handleArrayChange = (name: string, value: string) => {
    setFormData(prev => {
      const array = [...prev[name as keyof typeof prev] as string[]];
      
      if (array.includes(value)) {
        return { ...prev, [name]: array.filter(item => item !== value) };
      } else {
        return { ...prev, [name]: [...array, value] };
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };
  
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white">Set Up Your Nutrition Profile</h2>
        <p className="text-indigo-200 mt-1">This information helps us personalize your nutrition experience</p>
      </div>
      
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step >= stepNumber ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div 
                    className={`w-12 h-1 ${
                      step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <div>Basic Info</div>
            <div>Dietary Preferences</div>
            <div>Health Goals</div>
            <div>Personalization</div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleNumberChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="30"
                  max="200"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleNumberChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="100"
                  max="250"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="extremely_active">Extremely Active (very hard exercise & physical job)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="calorieGoal" className="block text-sm font-medium text-gray-700">Daily Calorie Goal</label>
                <input
                  type="number"
                  id="calorieGoal"
                  name="calorieGoal"
                  value={formData.calorieGoal}
                  onChange={handleNumberChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="1200"
                  max="5000"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">Recommended based on your height, weight, and activity level</p>
              </div>
            </div>
          )}
          
          {/* Step 2: Dietary Preferences */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Dietary Preferences</h3>
              
              <div>
                <label htmlFor="dietType" className="block text-sm font-medium text-gray-700">Diet Type</label>
                <select
                  id="dietType"
                  name="dietType"
                  value={formData.dietType}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="standard">Standard (No Restrictions)</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="mediterranean">Mediterranean</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Preferences</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Italian', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'Thai', 'Mediterranean', 'American'].map(cuisine => (
                    <div key={cuisine} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cuisine-${cuisine}`}
                        checked={formData.cuisinePreferences.includes(cuisine)}
                        onChange={() => handleArrayChange('cuisinePreferences', cuisine)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`cuisine-${cuisine}`} className="ml-2 text-sm text-gray-700">
                        {cuisine}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">Allergies</label>
                <textarea
                  id="allergies"
                  name="allergiesText"
                  placeholder="Enter allergies separated by commas (e.g., peanuts, shellfish, dairy)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value.split(',').map(item => item.trim()).filter(Boolean) }))}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="intolerances" className="block text-sm font-medium text-gray-700">Food Intolerances</label>
                <textarea
                  id="intolerances"
                  name="intolerancesText"
                  placeholder="Enter intolerances separated by commas (e.g., gluten, lactose)"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, intolerances: e.target.value.split(',').map(item => item.trim()).filter(Boolean) }))}
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Step 3: Health Goals */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Health Goals</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Health Goals</label>
                <div className="space-y-2">
                  {['lose weight', 'gain muscle', 'maintain weight', 'improve energy', 'manage diabetes', 'lower cholesterol', 'heart health', 'better digestion'].map(goal => (
                    <div key={goal} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`goal-${goal}`}
                        checked={formData.healthGoals.includes(goal)}
                        onChange={() => handleArrayChange('healthGoals', goal)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`goal-${goal}`} className="ml-2 text-sm text-gray-700 capitalize">
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="proteinGoal" className="block text-sm font-medium text-gray-700">Protein Goal (g)</label>
                  <input
                    type="number"
                    id="proteinGoal"
                    name="proteinGoal"
                    value={formData.proteinGoal}
                    onChange={handleNumberChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min="20"
                    max="300"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="carbsGoal" className="block text-sm font-medium text-gray-700">Carbs Goal (g)</label>
                  <input
                    type="number"
                    id="carbsGoal"
                    name="carbsGoal"
                    value={formData.carbsGoal}
                    onChange={handleNumberChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min="50"
                    max="500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="fatGoal" className="block text-sm font-medium text-gray-700">Fat Goal (g)</label>
                  <input
                    type="number"
                    id="fatGoal"
                    name="fatGoal"
                    value={formData.fatGoal}
                    onChange={handleNumberChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    min="20"
                    max="200"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="favoriteFoods" className="block text-sm font-medium text-gray-700">Favorite Foods</label>
                <textarea
                  id="favoriteFoods"
                  name="favoriteFoodsText"
                  placeholder="Enter favorite foods separated by commas"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteFoods: e.target.value.split(',').map(item => item.trim()).filter(Boolean) }))}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="dislikedFoods" className="block text-sm font-medium text-gray-700">Disliked Foods</label>
                <textarea
                  id="dislikedFoods"
                  name="dislikedFoodsText"
                  placeholder="Enter disliked foods separated by commas"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={2}
                  onChange={(e) => setFormData(prev => ({ ...prev, dislikedFoods: e.target.value.split(',').map(item => item.trim()).filter(Boolean) }))}
                ></textarea>
              </div>
            </div>
          )}
          
          {/* Step 4: Personalization */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Personalization</h3>
              
              <div>
                <label htmlFor="mealSizePreference" className="block text-sm font-medium text-gray-700">Meal Size Preference</label>
                <select
                  id="mealSizePreference"
                  name="mealSizePreference"
                  value={formData.mealSizePreference}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="small_frequent">Small, Frequent Meals (5-6 per day)</option>
                  <option value="medium_regular">Medium, Regular Meals (3-4 per day)</option>
                  <option value="large_infrequent">Large, Infrequent Meals (1-2 per day)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="budgetLevel" className="block text-sm font-medium text-gray-700">Budget Level</label>
                <select
                  id="budgetLevel"
                  name="budgetLevel"
                  value={formData.budgetLevel}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="economic">Economic (Budget-friendly options)</option>
                  <option value="moderate">Moderate (Balanced cost)</option>
                  <option value="premium">Premium (Higher-end ingredients)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="cookingSkill" className="block text-sm font-medium text-gray-700">Cooking Skill Level</label>
                <select
                  id="cookingSkill"
                  name="cookingSkill"
                  value={formData.cookingSkill}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="beginner">Beginner (Simple recipes only)</option>
                  <option value="intermediate">Intermediate (Comfortable with most recipes)</option>
                  <option value="advanced">Advanced (Complex recipes welcome)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">Available Cooking Time</label>
                <select
                  id="cookingTime"
                  name="cookingTime"
                  value={formData.cookingTime}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="minimal">Minimal (15 minutes or less)</option>
                  <option value="moderate">Moderate (15-30 minutes)</option>
                  <option value="extensive">Extensive (30+ minutes)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Previous
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="ml-auto py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Complete Setup
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}