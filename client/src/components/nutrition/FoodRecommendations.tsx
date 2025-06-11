// client/src/components/nutrition/FoodRecommendations.tsx

import { useState } from 'react';
import * as nutritionService from '@/services/nutritionService';

interface FoodRecommendationsProps {
  recommendations: any[];
}

export default function FoodRecommendations({ recommendations }: FoodRecommendationsProps) {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  
  const toggleRecommendation = (id: string) => {
    if (expandedRecommendation === id) {
      setExpandedRecommendation(null);
    } else {
      setExpandedRecommendation(id);
    }
  };
  
  const handleAccept = async (id: string) => {
    try {
      await nutritionService.updateRecommendationFeedback(id, { accepted: true });
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      await nutritionService.updateRecommendationFeedback(id, { rejected: true });
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
    }
  };
  
  const getCategoryEmoji = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      'vegetable': '🥦',
      'fruit': '🍎',
      'grain': '🌾',
      'protein': '🥩',
      'dairy': '🥛',
      'legume': '🫘',
      'nut': '🥜',
      'seed': '🌱',
      'seafood': '🐟',
      'beverage': '🥤',
      'herb': '🌿',
      'spice': '🧂',
      'oil': '🫒',
      'dessert': '🍰',
      'snack': '🍿'
    };
    
    const lowerCategory = category.toLowerCase();
    
    for (const [key, emoji] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) {
        return emoji;
      }
    }
    
    return '🍽️';
  };
  
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No food recommendations available</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <div key={recommendation._id} className="border border-gray-200 rounded-lg overflow-hidden">
          <div 
            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => toggleRecommendation(recommendation._id)}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-3">{getCategoryEmoji(recommendation.category)}</span>
              <div>
                <h3 className="font-medium text-gray-800">{recommendation.foodName}</h3>
                <p className="text-sm text-gray-500">{recommendation.category}</p>
              </div>
            </div>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 text-gray-400 transition-transform ${expandedRecommendation === recommendation._id ? 'transform rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {expandedRecommendation === recommendation._id && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Why Recommended</h4>
                <p className="text-sm text-gray-600">{recommendation.whyRecommended}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Nutritional Benefits</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {recommendation.nutritionalBenefits.map((benefit: string, index: number) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Nutrition Info</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-500">Calories:</span> <span className="font-semibold">{recommendation.calories}</span></p>
                    <p><span className="text-gray-500">Protein:</span> <span className="font-semibold">{recommendation.protein}g</span></p>
                    <p><span className="text-gray-500">Carbs:</span> <span className="font-semibold">{recommendation.carbs}g</span></p>
                    <p><span className="text-gray-500">Fat:</span> <span className="font-semibold">{recommendation.fat}g</span></p>
                    <p><span className="text-gray-500">Fiber:</span> <span className="font-semibold">{recommendation.fiber}g</span></p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Best Time to Consume</h4>
                  <p className="text-sm text-gray-600 capitalize">{recommendation.bestTimeToConsume.replace('_', ' ')}</p>
                  
                  <h4 className="font-medium text-gray-700 mt-4 mb-2">Preparation</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {recommendation.preparationMethods.slice(0, 2).map((method: string, index: number) => (
                      <li key={index}>{method}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {recommendation.quickRecipe && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Quick Recipe</h4>
                  <p className="text-sm text-gray-600">{recommendation.quickRecipe}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => handleReject(recommendation._id)}
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm"
                >
                  Not Interested
                </button>
                <button
                  onClick={() => handleAccept(recommendation._id)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                >
                  Add to Favorites
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}