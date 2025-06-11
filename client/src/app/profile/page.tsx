// client/src/app/profile/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface Author {
  _id: string;
  username: string;
  profilePictureUrl?: string;
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  likes: string[];
  createdAt: string;
}

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    location?: string;
    profilePictureUrl?: string;
    savedPosts: Post[]; // This will be populated with full post objects
}

// --- Reusable Post Card Component ---
const PostCard = ({ post }: { post: Post }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {post.author.username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="font-bold text-gray-800">{post.author.username}</p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
    </div>
  );

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('rats_token');
    if (!token) {
      router.push('/login');
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/users/profile', getAuthHeaders());
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [router, getAuthHeaders]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading Profile...</div>;
  }

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Could not load profile.</div>;
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* --- Profile Header --- */}
        <div className="flex items-center space-x-6 bg-white p-8 rounded-2xl shadow-md mb-8">
            <div className="h-24 w-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-4xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                <p className="text-gray-600">{profile.email}</p>
                {profile.location && <p className="text-sm text-gray-500 mt-1">{profile.location}</p>}
            </div>
        </div>

        {/* --- Saved Posts Section --- */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Posts</h2>
            <div className="space-y-6">
            {profile.savedPosts && profile.savedPosts.length > 0 ? (
                profile.savedPosts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
                <div className="text-center py-10 bg-white rounded-2xl">
                    <p className="text-gray-500">You haven't saved any posts yet.</p>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
}
