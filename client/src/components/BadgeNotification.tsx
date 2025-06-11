// client/src/components/BadgeNotification.tsx
'use client';

import { useEffect } from 'react';

// Define the structure of a badge object
interface Badge {
  name: string;
  description: string;
  icon: string;
}

// The props the component will accept
interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

// THE FIX: Accept a single 'props' object
export default function BadgeNotification(props: BadgeNotificationProps) {
  // Destructure the props inside the function for clarity and safety
  const { badge, onClose } = props;

  // Automatically close the notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!badge) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white rounded-xl shadow-2xl p-4 animate-fade-in-down ring-1 ring-black ring-opacity-5">
        <div className="flex items-start">
          <div className="text-5xl mr-4">{badge.icon}</div>
          <div className="flex-grow">
            <p className="text-sm font-bold text-blue-600">BADGE UNLOCKED!</p>
            <p className="text-lg font-bold text-gray-800">{badge.name}</p>
            <p className="text-sm text-gray-600">{badge.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
