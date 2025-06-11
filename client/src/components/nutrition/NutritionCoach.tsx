// client/src/components/nutrition/NutritionCoach.tsx

import { useState, useRef, useEffect } from 'react';
import * as nutritionService from '@/services/nutritionService';

interface NutritionCoachProps {
  profile: any;
}

export default function NutritionCoach({ profile }: NutritionCoachProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<{role: 'user' | 'ai', content: string}[]>([
    {
      role: 'ai',
      content: `Hello ${profile?.user?.username || 'there'}! I'm your AI Nutrition Coach. How can I help you today? You can ask me about meal planning, nutrition advice, or food recommendations.`
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message to conversation
    const userMessage = { role: 'user' as const, content: query };
    setConversation(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    try {
      // In a real implementation, this would call a dedicated nutrition AI endpoint
      // For now, we'll use the text analysis endpoint as a placeholder
      const response = await nutritionService.analyzeFoodText(query);
      
      // Create a more conversational response based on the analysis
      let aiResponse = '';
      
      if (query.toLowerCase().includes('recommend') || query.toLowerCase().includes('suggestion')) {
        aiResponse = `Based on your nutrition profile, I'd recommend trying ${response.foodName}. It's a great source of nutrients with approximately ${response.calories} calories per serving. It provides ${response.protein}g of protein, ${response.carbs}g of carbs, and ${response.fat}g of fat. Some key benefits include: ${response.benefits?.join(', ') || 'balanced nutrition'}.`;
      } else if (query.toLowerCase().includes('analyze') || query.toLowerCase().includes('what')) {
        aiResponse = `${response.foodName} contains approximately ${response.calories} calories per ${response.portion}. It provides ${response.protein}g of protein, ${response.carbs}g of carbs, and ${response.fat}g of fat. It's categorized as ${response.category} and contains key nutrients like ${response.keyNutrients?.join(', ') || 'various vitamins and minerals'}.`;
      } else {
        aiResponse = `I've analyzed your question about ${response.foodName}. This food contains approximately ${response.calories} calories per serving with ${response.protein}g of protein, ${response.carbs}g of carbs, and ${response.fat}g of fat. Is there anything specific about this food you'd like to know more about?`;
      }
      
      // Add AI response to conversation
      setConversation(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setConversation(prev => [...prev, { 
        role: 'ai', 
        content: "I'm sorry, I couldn't process your question right now. Could you try asking something else about nutrition or meal planning?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          AI Nutrition Coach
        </h2>
      </div>
      
      <div className="h-80 overflow-y-auto p-4 bg-gray-50">
        {conversation.map((message, index) => (
          <div 
            key={index} 
            className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}
          >
            <div 
              className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mb-4">
            <div className="inline-block rounded-lg px-4 py-2 bg-white border border-gray-200 text-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex flex-wrap gap-2 mb-3">
          <button 
            onClick={() => handleQuickQuestion("What should I eat for lunch today?")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition"
          >
            What should I eat for lunch?
          </button>
          <button 
            onClick={() => handleQuickQuestion("Analyze the nutrition in a chicken salad")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition"
          >
            Analyze chicken salad
          </button>
          <button 
            onClick={() => handleQuickQuestion("How can I increase my protein intake?")}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition"
          >
            How to increase protein?
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about nutrition, meals, or food..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition disabled:bg-indigo-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}