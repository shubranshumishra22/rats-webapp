'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';

export default function SettingsPage() {
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get username from localStorage
    const storedUsername = localStorage.getItem('rats_username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [router]);
  
  const settingsCategories = [
    {
      title: 'Account',
      description: 'Manage your account settings and preferences',
      icon: '👤',
      color: 'bg-blue-500',
      link: '/settings/account'
    },
    {
      title: 'Social Media Accounts',
      description: 'Connect your social media accounts for event sharing',
      icon: '📱',
      color: 'bg-purple-500',
      link: '/settings/social-accounts'
    },
    {
      title: 'Notifications',
      description: 'Configure how and when you receive notifications',
      icon: '🔔',
      color: 'bg-yellow-500',
      link: '/settings/notifications'
    },
    {
      title: 'Privacy',
      description: 'Control your privacy settings and data',
      icon: '🔒',
      color: 'bg-green-500',
      link: '/settings/privacy'
    }
  ];
  
  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
          
          {username && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-800">{username}</h2>
                  <p className="text-gray-500">RATS Member</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settingsCategories.map((category, index) => (
              <Link key={index} href={category.link}>
                <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-white text-2xl`}>
                      {category.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-800">{category.title}</h3>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                localStorage.removeItem('rats_token');
                localStorage.removeItem('rats_username');
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}