// client/src/components/nutrition/BehavioralInsights.tsx

import { useState } from 'react';

interface BehavioralInsightsProps {
  insights: any;
}

export default function BehavioralInsights({ insights }: BehavioralInsightsProps) {
  const [activeTab, setActiveTab] = useState('insights');
  
  if (!insights) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-indigo-600 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Behavioral Insights
        </h2>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'patterns'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('patterns')}
          >
            Patterns
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
          <button
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'strategies'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('strategies')}
          >
            CBT Strategies
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Key Insights</h3>
            {insights.insights.map((insight: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-700 mb-1">{insight.category}</h4>
                <p className="text-gray-700">{insight.observation}</p>
                <p className="text-sm text-gray-500 mt-2">Impact: {insight.impact}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Identified Patterns</h3>
            {insights.patterns.map((pattern: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-700 mb-1">{pattern.type}</h4>
                <p className="text-gray-700">{pattern.description}</p>
                <p className="text-sm text-gray-500 mt-2">Frequency: {pattern.frequency}</p>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personalized Recommendations</h3>
            {insights.recommendations.map((recommendation: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-700 mb-1">{recommendation.area}</h4>
                <p className="text-gray-700">{recommendation.recommendation}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-600">Implementation Steps:</p>
                  <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
                    {recommendation.implementationSteps.map((step: string, stepIndex: number) => (
                      <li key={stepIndex}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'strategies' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">CBT Strategies</h3>
            {insights.cbtStrategies.map((strategy: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-700 mb-1">Challenge: {strategy.challenge}</h4>
                <p className="text-gray-700"><span className="font-medium">Technique:</span> {strategy.technique}</p>
                <p className="text-gray-700 mt-2"><span className="font-medium">Application:</span> {strategy.application}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}