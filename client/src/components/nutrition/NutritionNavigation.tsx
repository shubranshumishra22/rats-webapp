// client/src/components/nutrition/NutritionNavigation.tsx

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NutritionNavigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="px-6 py-4 bg-indigo-600">
        <h2 className="text-xl font-semibold text-white">Smart Nutritionist</h2>
      </div>
      
      <div className="p-4">
        <nav className="flex flex-wrap gap-2">
          <Link 
            href="/nutrition"
            className={`px-4 py-2 rounded-lg transition ${
              isActive('/nutrition') 
                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </Link>
          
          <Link 
            href="/nutrition/food-recognition"
            className={`px-4 py-2 rounded-lg transition ${
              isActive('/nutrition/food-recognition') 
                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Food Recognition
          </Link>
          
          <Link 
            href="/nutrition/meal-plans"
            className={`px-4 py-2 rounded-lg transition ${
              isActive('/nutrition/meal-plans') 
                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Meal Plans
          </Link>
          
          <Link 
            href="/nutrition/food-log"
            className={`px-4 py-2 rounded-lg transition ${
              isActive('/nutrition/food-log') 
                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Food Log
          </Link>
          
          <Link 
            href="/nutrition/profile"
            className={`px-4 py-2 rounded-lg transition ${
              isActive('/nutrition/profile') 
                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Profile
          </Link>
        </nav>
      </div>
    </div>
  );
}