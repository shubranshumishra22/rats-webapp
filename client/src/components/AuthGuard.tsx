'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientOnly from './ClientOnly';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('rats_token');
    
    if (!token) {
      console.log('No token found, redirecting to login');
      router.push('/login');
      setIsAuthenticated(false);
      return;
    }

    try {
      // Verify token is valid (not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() >= expiry) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('rats_token');
        router.push('/login');
        setIsAuthenticated(false);
        return;
      }
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error verifying token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
      setIsAuthenticated(false);
    }
  }, [router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <ClientOnly>{children}</ClientOnly> : null;
}