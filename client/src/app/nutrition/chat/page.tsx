'use client';

import { useState, useEffect } from 'react';
import NutritionNavBar from '../components/NutritionNavBar';

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

export default function NutritionChat() {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setCharHistory] = useState([
    { role: 'ai', content: 'Hello! How can I assist you with your nutrition today?' }
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    // Add user message to chat
    setCharHistory(prev => [...prev, { role: 'user', content: message }]);
    
    // Clear input
    setMessage('');
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      setCharHistory(prev => [...prev, { 
        role: 'ai', 
        content: 'I understand you\'re interested in nutrition advice. How can I help you specifically with your dietary goals?' 
      }]);
    }, 1000);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile View */}
      <div className="md:hidden flex flex-col h-screen">
        <div className="p-4 bg-white shadow">
          <h1 className="text-xl font-bold text-center text-blue-600">AI Nutrition Coach</h1>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto pb-20">
          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}
            >
              <div 
                className={`p-3 rounded-lg max-w-xs ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200 fixed bottom-16 left-0 right-0">
          <div className="flex space-x-2 mb-2">
            <button className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-gray-200">
              Meal Suggestions
            </button>
            <button className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-gray-200">
              Nutrient Advice
            </button>
          </div>
          <div className="flex">
            <input 
              type="text" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
        
        <NutritionNavBar />
      </div>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        {/* Desktop Navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <NavLink href="/nutrition" label="Home" isActive={false} />
                <NavLink href="/nutrition/chat" label="Chat" isActive={true} />
                <NavLink href="/nutrition/progress" label="Progress" isActive={false} />
              </div>
              <div className="flex items-center">
                <button className="text-red-600 hover:text-red-800 font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-md flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-blue-600">AI Nutrition Coach</h1>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto h-96">
              {chatHistory.map((msg, index) => (
                <div 
                  key={index} 
                  className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-md ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-gray-800'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2 mb-3">
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Meal Suggestions
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Nutrient Advice
                </button>
                <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Track Intake
                </button>
              </div>
              <div className="flex">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}