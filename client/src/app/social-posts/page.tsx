'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientOnly from '@/components/ClientOnly';

interface SocialMediaPost {
  _id: string;
  platform: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  publishedAt?: string;
  scheduledFor?: string;
  metrics?: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
  };
  event?: {
    _id: string;
    title: string;
  };
}

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);
  
  // Fetch social media posts
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // This would be a real API endpoint in a full implementation
      // For now, we'll simulate some posts
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate posts data
      const simulatedPosts: SocialMediaPost[] = [
        {
          _id: 'post1',
          platform: 'instagram',
          content: 'Happy Birthday to my amazing friend! 🎂 Hope your day is as wonderful as you are!',
          status: 'published',
          publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          metrics: {
            likes: 42,
            comments: 7,
            shares: 3,
            impressions: 156
          },
          event: {
            _id: 'event1',
            title: 'Sarah\'s Birthday'
          }
        },
        {
          _id: 'post2',
          platform: 'instagram',
          content: 'Celebrating 5 amazing years together! 💍 Every moment with you has been a blessing.',
          status: 'published',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          metrics: {
            likes: 78,
            comments: 12,
            shares: 5,
            impressions: 230
          },
          event: {
            _id: 'event2',
            title: 'Anniversary with John'
          }
        },
        {
          _id: 'post3',
          platform: 'instagram',
          content: 'Wishing everyone a wonderful holiday season! ✨ May your days be merry and bright!',
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          event: {
            _id: 'event3',
            title: 'Holiday Greetings'
          }
        }
      ];
      
      setPosts(simulatedPosts);
    } catch (err: any) {
      console.error('Error fetching social media posts:', err);
      setError(err.response?.data?.message || 'Failed to load social media posts');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchPosts();
  }, [fetchPosts, router]);
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return '📸';
      case 'facebook':
        return '👍';
      case 'twitter':
        return '🐦';
      case 'whatsapp':
        return '💬';
      default:
        return '📱';
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Published</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Scheduled</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Draft</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Failed</span>;
      default:
        return null;
    }
  };
  
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
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Social Media Posts</h1>
            <Link 
              href="/settings/social-accounts" 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Social Accounts
            </Link>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {posts.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <div className="text-5xl mb-4">📱</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Social Media Posts Yet</h2>
              <p className="text-gray-600 mb-6">
                Connect your social media accounts and start sharing your event messages.
              </p>
              <Link 
                href="/settings/social-accounts" 
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Connect Social Accounts
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div key={post._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getPlatformIcon(post.platform)}</span>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} Post
                          </h3>
                          {post.event && (
                            <Link 
                              href={`/events/${post.event._id}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {post.event.title}
                            </Link>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(post.status)}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md mb-4 whitespace-pre-line">
                      {post.content}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div>
                        {post.status === 'published' ? (
                          <span>Published: {formatDate(post.publishedAt)}</span>
                        ) : post.status === 'scheduled' ? (
                          <span>Scheduled for: {formatDate(post.scheduledFor)}</span>
                        ) : (
                          <span>Created: {formatDate(post.publishedAt || post.scheduledFor)}</span>
                        )}
                      </div>
                      
                      {post.status === 'scheduled' && (
                        <button className="text-red-600 hover:underline">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {post.status === 'published' && post.metrics && (
                    <div className="bg-gray-50 border-t border-gray-100 p-4">
                      <h4 className="font-medium text-gray-700 mb-3">Engagement Metrics</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded-md text-center">
                          <div className="text-xl font-semibold text-blue-600">{post.metrics.likes}</div>
                          <div className="text-xs text-gray-500">Likes</div>
                        </div>
                        <div className="bg-white p-3 rounded-md text-center">
                          <div className="text-xl font-semibold text-purple-600">{post.metrics.comments}</div>
                          <div className="text-xs text-gray-500">Comments</div>
                        </div>
                        <div className="bg-white p-3 rounded-md text-center">
                          <div className="text-xl font-semibold text-green-600">{post.metrics.shares}</div>
                          <div className="text-xs text-gray-500">Shares</div>
                        </div>
                        <div className="bg-white p-3 rounded-md text-center">
                          <div className="text-xl font-semibold text-yellow-600">{post.metrics.impressions}</div>
                          <div className="text-xs text-gray-500">Impressions</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}