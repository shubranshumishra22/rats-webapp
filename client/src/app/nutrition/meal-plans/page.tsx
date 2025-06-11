// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import ClientOnly from '@/components/ClientOnly';
// import * as nutritionService from '@/services/nutritionService';
// import NutritionNavigation from '@/components/nutrition/NutritionNavigation';
// // import MealPlanDisplay from '@/components/nutrition/MealPlanDisplay';

// export default function MealPlansPage() {
//   const [mealPlan, setMealPlan] = useState<any>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [isGenerating, setIsGenerating] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     // Check if user is logged in
//     const token = localStorage.getItem('rats_token');
//     if (!token) {
//       router.push('/login');
//       return;
//     }
    
//     fetchMealPlan();
//   }, [router, selectedDate]);

//   const fetchMealPlan = async () => {
//     try {
//       setIsLoading(true);
//       const dateString = selectedDate.toISOString();
//       const mealPlanData = await nutritionService.getActiveMealPlan(dateString);
//       setMealPlan(mealPlanData);
//     } catch (error: any) {
//       console.error('Error fetching meal plan:', error);
//       if (error.response && error.response.status !== 404) {
//         // Only show error if it's not a 404 (no meal plan found)
//         alert('Error fetching meal plan. Please try again.');
//       }
//       setMealPlan(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGenerateMealPlan = async () => {
//     try {
//       setIsGenerating(true);
//       const dateString = selectedDate.toISOString();
//       const newMealPlan = await nutritionService.generateMealPlan(dateString);
//       setMealPlan(newMealPlan);
//     } catch (error) {
//       console.error('Error generating meal plan:', error);
//       alert('Error generating meal plan. Please try again.');
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const handleDateChange = (date: Date) => {
//     setSelectedDate(date);
//   };

//   const formatDateForDisplay = (date: Date) => {
//     return date.toLocaleDateString('en-US', {
//       weekday: 'long',
//       month: 'long',
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const goToNextDay = () => {
//     const nextDay = new Date(selectedDate);
//     nextDay.setDate(nextDay.getDate() + 1);
//     setSelectedDate(nextDay);
//   };

//   const goToPreviousDay = () => {
//     const previousDay = new Date(selectedDate);
//     previousDay.setDate(previousDay.getDate() - 1);
//     setSelectedDate(previousDay);
//   };

//   const goToToday = () => {
//     setSelectedDate(new Date());
//   };

//   return (
//     <ClientOnly>
//       <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
//         <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
//           <header className="mb-6">
//             <h1 className="text-2xl font-bold text-indigo-800">Meal Plans</h1>
//             <p className="text-gray-600">View and generate personalized meal plans</p>
//           </header>
          
//           <NutritionNavigation />
          
//           <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
//             <div className="bg-indigo-600 px-6 py-4">
//               <div className="flex flex-col sm:flex-row justify-between items-center">
//                 <h2 className="text-xl font-semibold text-white mb-3 sm:mb-0">Meal Plan</h2>
                
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={goToPreviousDay}
//                     className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                   </button>
                  
//                   <button
//                     onClick={goToToday}
//                     className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition text-sm"
//                   >
//                     Today
//                   </button>
                  
//                   <button
//                     onClick={goToNextDay}
//                     className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
            
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h3 className="text-lg font-medium text-gray-900">{formatDateForDisplay(selectedDate)}</h3>
                
//                 <input
//                   type="date"
//                   value={selectedDate.toISOString().split('T')[0]}
//                   onChange={(e) => handleDateChange(new Date(e.target.value))}
//                   className="border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
              
//               {isLoading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//                 </div>
//               ) : mealPlan ? (
//                 <MealPlanDisplay mealPlan={mealPlan} />
//               ) : (
//                 <div className="text-center py-12">
//                   <div className="mx-auto w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                   </div>
//                   <h3 className="text-xl font-medium text-gray-900 mb-2">No Meal Plan Found</h3>
//                   <p className="text-gray-500 mb-6">There is no meal plan for this date. Would you like to generate one?</p>
//                   <button
//                     onClick={handleGenerateMealPlan}
//                     disabled={isGenerating}
//                     className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center mx-auto"
//                   >
//                     {isGenerating ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         Generating...
//                       </>
//                     ) : (
//                       'Generate Meal Plan'
//                     )}
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </ClientOnly>
//   );
// }