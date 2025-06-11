'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';

interface ConnectedAccounts {
  instagram: boolean;
  facebook: boolean;
  twitter: boolean;
}

export default function SocialAccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccounts>({
    instagram: false,
    facebook: false,
    twitter: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);
  
  // Fetch connected accounts
  const fetchConnectedAccounts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await axios.get(
        'http://localhost:5001/api/social-auth/connected-accounts',
        getAuthHeaders()
      );
      
      setConnectedAccounts(response.data.connectedAccounts);
    } catch (err: any) {
      console.error('Error fetching connected accounts:', err);
      setError(err.response?.data?.message || 'Failed to load connected accounts');
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);
  
  // Connect Instagram
  const connectInstagram = async () => {
    try {
      setError('');
      
      const response = await axios.get(
        'http://localhost:5001/api/social-auth/instagram/auth-url',
        getAuthHeaders()
      );
      
      // Redirect to Instagram authorization page
      window.location.href = response.data.authUrl;
    } catch (err: any) {
      console.error('Error getting Instagram auth URL:', err);
      setError(err.response?.data?.message || 'Failed to connect Instagram');
    }
  };
  
  // Disconnect Instagram
  const disconnectInstagram = async () => {
    if (!confirm('Are you sure you want to disconnect your Instagram account?')) {
      return;
    }
    
    try {
      setError('');
      
      await axios.delete(
        'http://localhost:5001/api/social-auth/instagram/disconnect',
        getAuthHeaders()
      );
      
      setSuccess('Instagram account disconnected successfully');
      fetchConnectedAccounts();
    } catch (err: any) {
      console.error('Error disconnecting Instagram:', err);
      setError(err.response?.data?.message || 'Failed to disconnect Instagram');
    }
  };
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchConnectedAccounts();
    
    // Check for success or error messages in URL
    const connected = searchParams.get('connected');
    const errorParam = searchParams.get('error');
    
    if (connected === 'instagram') {
      setSuccess('Instagram account connected successfully');
    }
    
    if (errorParam) {
      setError(
        errorParam === 'instagram_auth_failed' 
          ? 'Failed to connect Instagram. Please try again.' 
          : 'An error occurred during authentication'
      );
    }
  }, [fetchConnectedAccounts, router, searchParams]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <Link href="/settings" className="text-blue-600 hover:underline mr-4">
              ← Back to Settings
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">Social Media Accounts</h1>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Connected Accounts</h2>
            <p className="text-gray-600 mb-6">
              Connect your social media accounts to automatically send event messages.
            </p>
            
            <div className="space-y-6">
              {/* Instagram */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg text-white text-2xl">
                    <span>📸</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">Instagram</h3>
                    <p className="text-sm text-gray-500">
                      {connectedAccounts.instagram 
                        ? 'Connected' 
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                
                {connectedAccounts.instagram ? (
                  <button
                    onClick={disconnectInstagram}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={connectInstagram}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
              
              {/* Facebook - Coming Soon */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-lg text-white text-2xl">
                    <span>👍</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">Facebook</h3>
                    <p className="text-sm text-gray-500">Coming soon</p>
                  </div>
                </div>
                
                <button
                  disabled
                  className="px-3 py-1 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
              
              {/* Twitter - Coming Soon */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-400 rounded-lg text-white text-2xl">
                    <span>🐦</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">Twitter</h3>
                    <p className="text-sm text-gray-500">Coming soon</p>
                  </div>
                </div>
                
                <button
                  disabled
                  className="px-3 py-1 bg-gray-200 text-gray-500 rounded-md cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">About Social Media Integration</h2>
            <div className="prose text-gray-600">
              <p>
                Connecting your social media accounts allows RATS to automatically send your event messages
                directly to your social platforms. This integration uses OAuth for secure authentication
                without storing your passwords.
              </p>
              <h3 className="text-md font-medium text-gray-700 mt-4">How it works:</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Connect your social media account using the buttons above</li>
                <li>When creating or editing an event, add the recipient's handle for that platform</li>
                <li>RATS will format your message appropriately for each platform</li>
                <li>On the event day, messages will be automatically sent or you can test them manually</li>
                <li>View engagement metrics to see how your messages performed</li>
              </ol>
              <p className="mt-4 text-sm text-gray-500">
                Note: RATS only requests the minimum permissions needed to post messages on your behalf.
                You can disconnect your accounts at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}