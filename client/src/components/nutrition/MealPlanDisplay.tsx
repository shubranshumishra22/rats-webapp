// // client/src/components/nutrition/MealPlanDisplay.tsx

// import { useState } from 'react';

// interface MealPlanDisplayProps {
//   mealPlan: any;
// }

// export default function MealPlanDisplay({ mealPlan }: MealPlanDisplayProps) {
//   const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  
//   const toggleMeal = (mealType: string) => {
//     if (expandedMeal === mealType) {
//       setExpandedMeal(null);
//     } else {
//       setExpandedMeal(mealType);
//     }
//   };
  
//   const getMealIcon = (mealType: string) => {
//     switch (mealType) {
//       case 'breakfast':
//         return '🍳';
//       case 'lunch':
//         return '🥗';
//       case 'dinner':
//         return '🍽️';
//       case 'snack':
//         return '🍎';
//       default:
//         return '🍽️';
//     }
//   };
  
//   const formatMealType = (mealType: string) => {
//     return mealType.charAt(0).toUpperCase() + mealType.slice(1);
//   };
  
//   if (!mealPlan || !mealPlan.meals || mealPlan.meals.length === 0) {
//     return (
//       <div className="text-center py-6">
//         <p className="text-gray-500">No meal plan available</p>
//       </div>
//     );
//   }
  
//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center mb-4">
//         <div className="flex items-center">
//           <span className="text-2xl mr-2">📆</span>
//           <span className="text-gray-700">
//             {new Date(mealPlan.date).toLocaleDateString('en-US', { 
//               weekday: 'long', 
//               month: 'long', 
//               day: 'numeric' 
//             })}
//           </span>
//         </div>
//         <div className="flex space-x-4">
//           <div className="text-sm">
//             <span className="text-gray-500">Calories:</span>
//             <span className="ml-1 font-semibold">{mealPlan.totalCalories.toFixed(0)}</span>
//           </div>
//           <div className="text-sm">
//             <span className="text-gray-500">Protein:</span>
//             <span className="ml-1 font-semibold">{mealPlan.totalProtein.toFixed(0)}g</span>
//           </div>
//           <div className="text-sm">
//             <span className="text-gray-500">Carbs:</span>
//             <span className="ml-1 font-semibold">{mealPlan.totalCarbs.toFixed(0)}g</span>
//           </div>
//           <div className="text-sm">
//             <span className="text-gray-500">Fat:</span>
//             <span className="ml-1 font-semibold">{mealPlan.totalFat.toFixed(0)}g</span>
//           </div>
//         </div>
//       </div>
      
//       <div className="space-y-3">
//         {mealPlan.meals.sort((a: any, b: any) => {
//           const mealOrder = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
//           return mealOrder[a.type] - mealOrder[b.type];
//         }).map((meal: any, index: number) => (
//           <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
//             <div 
//               className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
//               onClick={() => toggleMeal(meal.type)}
//             >
//               <div className="flex items-center">
//                 <span className="text-2xl mr-3">{getMealIcon(meal.type)}</span>
//                 <div>
//                   <h3 className="font-medium text-gray-800">{formatMealType(meal.type)}</h3>
//                   <p className="text-sm text-gray-500">{meal.time}</p>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <div className="text-sm">
//                   <span className="text-gray-500">Calories:</span>
//                   <span className="ml-1 font-semibold">{meal.totalCalories.toFixed(0)}</span>
//                 </div>
//                 <svg 
//                   xmlns="http://www.w3.org/2000/svg" 
//                   className={`h-5 w-5 text-gray-400 transition-transform ${expandedMeal === meal.type ? 'transform rotate-180' : ''}`} 
//                   viewBox="0 0 20 20" 
//                   fill="currentColor"
//                 >
//                   <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//                 </svg>
//               </div>
//             </div>
            
//             {expandedMeal === meal.type && (
//               <div className="p-4 bg-gray-50 border-t border-gray-200">
//                 <div className="space-y-3">
//                   {meal.items.map((item: any, itemIndex: number) => (
//                     <div key={itemIndex} className="flex justify-between items-start">
//                       <div>
//                         <h4 className="font-medium text-gray-800">{item.name}</h4>
//                         <p className="text-sm text-gray-500">{item.portion}</p>
//                         {item.ingredients && item.ingredients.length > 0 && (
//                           <p className="text-xs text-gray-500 mt-1">
//                             Ingredients: {item.ingredients.join(', ')}
//                           </p>
//                         )}
//                         {item.recipe && (
//                           <p className="text-xs text-gray-600 mt-1 italic">
//                             {item.recipe}
//                           </p>
//                         )}
//                         {item.alternatives && item.alternatives.length > 0 && (
//                           <p className="text-xs text-gray-500 mt-1">
//                             Alternatives: {item.alternatives.join(', ')}
//                           </p>
//                         )}
//                       </div>
//                       <div className="flex space-x-3 text-xs">
//                         <div>
//                           <span className="text-gray-500">Cal:</span>
//                           <span className="ml-1 font-semibold">{item.calories.toFixed(0)}</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">P:</span>
//                           <span className="ml-1 font-semibold">{item.protein.toFixed(1)}g</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">C:</span>
//                           <span className="ml-1 font-semibold">{item.carbs.toFixed(1)}g</span>
//                         </div>
//                         <div>
//                           <span className="text-gray-500">F:</span>
//                           <span className="ml-1 font-semibold">{item.fat.toFixed(1)}g</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
                
//                 {meal.notes && (
//                   <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
//                     <p className="text-sm text-yellow-800">{meal.notes}</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}
//       </div>
      
//       {mealPlan.notes && (
//         <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
//           <h3 className="font-medium text-indigo-800 mb-2">Notes</h3>
//           <p className="text-sm text-indigo-700">{mealPlan.notes}</p>
//         </div>
//       )}
//     </div>
//   );
// }