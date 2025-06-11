// client/src/components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // This effect runs only on the client, after the component has mounted
  useEffect(() => {
    setIsMounted(true);
    
    // Check if user is authenticated
    const token = localStorage.getItem('rats_token');
    if (!token && !noNavRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('rats_token');
    router.push('/login');
  };

  // Define the routes where the Navbar should be hidden
  const noNavRoutes = ['/login', '/register'];

  // By returning null until the component is mounted on the client,
  // we ensure the server and client render the same initial empty content.
  // This prevents the hydration mismatch error.
  if (!isMounted || noNavRoutes.some(route => pathname === route)) {
    return null;
  }

  return (
    <ClientOnly>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                  Wellness Hub
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="flex items-center space-x-1">
              <Link 
                href="/" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/dashboard' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Goals
              </Link>
              <Link 
                href="/community" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/community' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Community
              </Link>
              <Link 
                href="/meditation" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/meditation') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Meditation
              </Link>

              <Link 
                href="/nutrition" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/nutrition') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Nutrition
              </Link>
              <Link 
                href="/events" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/events') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Events
              </Link>
              <Link 
                href="/profile" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith('/profile') 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
            
          </div>
        </div>
      </nav>
    </ClientOnly>
  );
}
