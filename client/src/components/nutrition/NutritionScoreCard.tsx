// client/src/components/nutrition/NutritionScoreCard.tsx

interface NutritionScoreCardProps {
  score: number;
}

export default function NutritionScoreCard({ score }: NutritionScoreCardProps) {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Determine message based on score
  const getScoreMessage = () => {
    if (score >= 90) return 'Excellent! Your nutrition is top-notch.';
    if (score >= 80) return 'Great job! Your nutrition is very good.';
    if (score >= 70) return 'Good! Your nutrition is on the right track.';
    if (score >= 60) return 'Fair. There\'s room for improvement in your nutrition.';
    if (score >= 50) return 'Needs attention. Consider making some dietary changes.';
    return 'Needs significant improvement. Let\'s work on your nutrition plan.';
  };
  
  // Calculate progress for the circular indicator
  const circumference = 2 * Math.PI * 45; // 45 is the radius
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Nutrition Score</h2>
      
      <div className="flex justify-center">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className="transition-all duration-1000 ease-out"
            />
            
            {/* Score text */}
            <text
              x="50"
              y="50"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="24"
              fontWeight="bold"
              className={getScoreColor()}
            >
              {score}
            </text>
            
            {/* Label */}
            <text
              x="50"
              y="65"
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              out of 100
            </text>
          </svg>
        </div>
      </div>
      
      <p className="text-center mt-4 text-gray-700">{getScoreMessage()}</p>
      
      <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-medium text-gray-700">Strengths</h3>
          <ul className="mt-1 text-gray-600 list-disc list-inside">
            {score >= 70 ? (
              <>
                <li>Balanced macronutrients</li>
                <li>Consistent meal timing</li>
              </>
            ) : score >= 50 ? (
              <>
                <li>Regular food logging</li>
                <li>Awareness of nutrition</li>
              </>
            ) : (
              <>
                <li>Starting to track nutrition</li>
                <li>Open to improvement</li>
              </>
            )}
          </ul>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <h3 className="font-medium text-gray-700">Areas to Improve</h3>
          <ul className="mt-1 text-gray-600 list-disc list-inside">
            {score >= 80 ? (
              <>
                <li>Micronutrient variety</li>
                <li>Hydration tracking</li>
              </>
            ) : score >= 60 ? (
              <>
                <li>Protein intake</li>
                <li>Fiber consumption</li>
              </>
            ) : (
              <>
                <li>Overall calorie balance</li>
                <li>Meal consistency</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}