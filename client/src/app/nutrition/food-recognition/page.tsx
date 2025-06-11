'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';
import * as nutritionService from '@/services/nutritionService';
import NutritionNavigation from '@/components/nutrition/NutritionNavigation';

export default function FoodRecognitionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mealType, setMealType] = useState('snack');
  const [mood, setMood] = useState('');
  const [hunger, setHunger] = useState(5);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setImage(imageData);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    try {
      setIsAnalyzing(true);
      const result = await nutritionService.analyzeFoodImage(image);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Failed to analyze the image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectFood = (food: any) => {
    setSelectedFood(food);
  };

  const saveFood = async () => {
    if (!selectedFood) return;
    
    try {
      setIsSaving(true);
      
      const foodData = {
        foodName: selectedFood.name,
        mealType,
        portion: selectedFood.portion,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        fiber: selectedFood.fiber || 0,
        sugar: selectedFood.sugar || 0,
        category: selectedFood.category,
        source: 'ai_image',
        imageUrl: image,
        mood,
        hunger: Number(hunger),
        fullness: 10 - Number(hunger)
      };
      
      await nutritionService.logFood(foodData);
      
      // Navigate back to nutrition page
      router.push('/nutrition');
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food log. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAnalysis = () => {
    setImage(null);
    setAnalysisResult(null);
    setSelectedFood(null);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-indigo-800">Smart Food Recognition</h1>
            <p className="text-gray-600">Take a photo of your food for instant nutritional analysis</p>
          </header>
          
          <NutritionNavigation />
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {!image ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center space-y-6">
                  {isCapturing ? (
                    <div className="w-full max-w-md">
                      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover"
                        ></video>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={captureImage}
                          className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <div className="mx-auto w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Capture Your Food</h2>
                        <p className="text-gray-600 mb-6">Take a photo of your meal to get instant nutritional information</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={startCamera}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Take Photo
                        </button>
                        
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Upload Image
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : !analysisResult ? (
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-md mb-6">
                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                      <img 
                        src={image} 
                        alt="Food" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full flex justify-between">
                    <button
                      onClick={resetAnalysis}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                      Retake
                    </button>
                    
                    <button
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center"
                    >
                      {isAnalyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Food'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : !selectedFood ? (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden mb-4">
                      <img 
                        src={image} 
                        alt="Food" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-medium text-indigo-800 mb-2">Overall Analysis</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Total Calories:</span> {analysisResult.totalNutrition.calories}</p>
                        <p><span className="font-medium">Quality Score:</span> {analysisResult.analysis.quality}/10</p>
                        <div>
                          <p className="font-medium">Benefits:</p>
                          <ul className="list-disc list-inside text-sm">
                            {analysisResult.analysis.benefits.slice(0, 2).map((benefit: string, index: number) => (
                              <li key={index}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-800 mb-2">Identified Foods</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {analysisResult.identifiedFoods.map((food: any, index: number) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg border cursor-pointer transition ${
                            selectedFood === food 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}
                          onClick={() => selectFood(food)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-800">{food.name}</h4>
                              <p className="text-sm text-gray-500">{food.portion}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">{food.calories} cal</p>
                              <p className="text-xs text-gray-500">P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={resetAnalysis}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Start Over
                      </button>
                      
                      <button
                        onClick={() => selectFood(analysisResult.identifiedFoods[0])}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        Select First Item
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Log Food</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden mb-4">
                      <img 
                        src={image} 
                        alt="Food" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h3 className="font-medium text-indigo-800 mb-2">{selectedFood.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p><span className="font-medium">Calories:</span> {selectedFood.calories}</p>
                          <p><span className="font-medium">Protein:</span> {selectedFood.protein}g</p>
                          <p><span className="font-medium">Carbs:</span> {selectedFood.carbs}g</p>
                          <p><span className="font-medium">Fat:</span> {selectedFood.fat}g</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Portion:</span> {selectedFood.portion}</p>
                          <p><span className="font-medium">Category:</span> {selectedFood.category}</p>
                          {selectedFood.fiber && <p><span className="font-medium">Fiber:</span> {selectedFood.fiber}g</p>}
                          {selectedFood.sugar && <p><span className="font-medium">Sugar:</span> {selectedFood.sugar}g</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-1">Meal Type</label>
                        <select
                          id="mealType"
                          value={mealType}
                          onChange={(e) => setMealType(e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="breakfast">Breakfast</option>
                          <option value="lunch">Lunch</option>
                          <option value="dinner">Dinner</option>
                          <option value="snack">Snack</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-1">Current Mood (Optional)</label>
                        <input
                          type="text"
                          id="mood"
                          value={mood}
                          onChange={(e) => setMood(e.target.value)}
                          placeholder="How are you feeling?"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="hunger" className="block text-sm font-medium text-gray-700 mb-1">Hunger Level (1-10)</label>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Not Hungry</span>
                          <input
                            type="range"
                            id="hunger"
                            min="1"
                            max="10"
                            value={hunger}
                            onChange={(e) => setHunger(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="text-sm text-gray-500 ml-2">Very Hungry</span>
                        </div>
                        <div className="text-center mt-1">
                          <span className="text-sm font-medium">{hunger}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={() => setSelectedFood(null)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      >
                        Back
                      </button>
                      
                      <button
                        onClick={saveFood}
                        disabled={isSaving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400 flex items-center"
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Food Log'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Hidden canvas for capturing images */}
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>
      </div>
    </ClientOnly>
  );
}