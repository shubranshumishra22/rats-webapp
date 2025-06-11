// client/src/app/profile/[username]/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';


// --- TYPE DEFINITIONS ---
interface Author { _id: string; username: string; }
interface Post { 
  _id: string; 
  author: Author; 
  content: string; 
  likes: string[]; 
  createdAt: string;
  sharedFrom?: Post; // Reference to the original post if this is a shared post
  type?: 'general' | 'event';
}
interface UserProfile {
    _id: string;
    username: string;
    bio?: string;
    location?: string;
    profilePictureUrl?: string;
    socialLinks?: {
        twitter?: string;
        instagram?: string;
        facebook?: string;
        linkedin?: string;
        website?: string;
    };
    streak?: number;
    xp: number;
    badges: string[];
    savedPosts?: Post[];
    sharedPosts?: Post[];
}

// --- BADGE DEFINITIONS (Client-side) ---
const ALL_BADGES: { [key: string]: { name: string; description: string; icon: string; } } = {
  "Task Taker": { name: "Task Taker", description: "Completed your first task.", icon: "✅" },
  "Task Master": { name: "Task Master", description: "Completed 10 tasks.", icon: "🎯" },
  "Team Player": { name: "Team Player", description: "Completed a collaborative task.", icon: "🤝" },
  "Week-Long Warrior": { name: "Week-Long Warrior", description: "Maintained a 7-day streak.", icon: "🗓️" },
  "Monthly Motivator": { name: "Monthly Motivator", description: "Maintained a 30-day streak.", icon: "📅" },
  "Town Crier": { name: "Town Crier", description: "Made your first post.", icon: "📣" },
};

// --- Reusable Components ---
const PostCard = ({ post }: { post: Post }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center mb-3">
        <Link href={`/profile/${post.author.username}`} className="flex items-center group">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">{post.author.username.charAt(0).toUpperCase()}</div>
            <div className="ml-3"><p className="font-bold text-gray-800 group-hover:text-blue-600">{post.author.username}</p><p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p></div>
        </Link>
      </div>
      
      {/* Show shared post info if this is a shared post */}
      {post.sharedFrom && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium">{post.author.username}</span> shared a post from{' '}
            {post.sharedFrom.author && (
              <Link href={`/profile/${post.sharedFrom.author.username}`} className="text-blue-600 hover:underline">
                {post.sharedFrom.author.username}
              </Link>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}
      
      {/* Show regular content if not a shared post */}
      {!post.sharedFrom && (
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      )}
    </div>
);

const BadgeCard = ({ badgeName }: { badgeName: string }) => {
    const badge = ALL_BADGES[badgeName];
    if (!badge) return null;
    return (
        <div className="bg-gray-100 p-4 rounded-lg text-center transition-transform hover:scale-105" title={badge.description}>
            <div className="text-4xl mb-2">{badge.icon}</div>
            <p className="font-bold text-gray-800 text-sm">{badge.name}</p>
        </div>
    );
};

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'shared' | 'edit'>('posts');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  
  // Form state for profile editing
  const [profileForm, setProfileForm] = useState({
    profilePictureUrl: '',
    bio: '',
    location: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      linkedin: '',
      website: ''
    }
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('rats_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('rats_token');
    if (!token) { router.push('/login'); return; }
    
    const fetchData = async () => {
      if (!params.username) return;
      try {
        const [profileRes, postsRes, myProfileRes] = await Promise.all([
            axios.get(`http://localhost:5001/api/users/profile/${params.username}`, getAuthHeaders()),
            axios.get(`http://localhost:5001/api/users/profile/${params.username}/posts`, getAuthHeaders()),
            axios.get('http://localhost:5001/api/users/profile/me', getAuthHeaders())
        ]);
        setProfile(profileRes.data);
        setUserPosts(postsRes.data);
        setMyProfile(myProfileRes.data);
        
        // Initialize form with current profile data if it's the user's own profile
        if (myProfileRes.data._id === profileRes.data._id) {
          setProfileForm({
            profilePictureUrl: profileRes.data.profilePictureUrl || '',
            bio: profileRes.data.bio || '',
            location: profileRes.data.location || '',
            socialLinks: {
              twitter: profileRes.data.socialLinks?.twitter || '',
              instagram: profileRes.data.socialLinks?.instagram || '',
              facebook: profileRes.data.socialLinks?.facebook || '',
              linkedin: profileRes.data.socialLinks?.linkedin || '',
              website: profileRes.data.socialLinks?.website || ''
            }
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router, getAuthHeaders, params.username]);
  
  const isMyProfile = profile?._id === myProfile?._id;
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social-')) {
      const socialNetwork = name.replace('social-', '');
      setProfileForm(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialNetwork]: value
        }
      }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isMyProfile) return;
    
    setIsSaving(true);
    
    try {
      const response = await axios.put(
        'http://localhost:5001/api/users/profile',
        profileForm,
        getAuthHeaders()
      );
      
      if (response.data) {
        // Update the profile state with the new data
        setProfile(prev => {
          if (!prev) return null;
          return {
            ...prev,
            profilePictureUrl: profileForm.profilePictureUrl,
            bio: profileForm.bio,
            location: profileForm.location,
            socialLinks: profileForm.socialLinks
          };
        });
        
        alert('Profile updated successfully!');
        setActiveTab('posts');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // --- LEVEL CALCULATION ---
  const level = profile ? Math.floor((profile.xp || 0) / 100) + 1 : 1;
  const xpForNextLevel = 100;
  const currentLevelXp = profile ? (profile.xp || 0) % 100 : 0;
  const xpPercentage = (currentLevelXp / xpForNextLevel) * 100;

  if (isLoading) { return <div className="flex justify-center items-center min-h-screen">Loading Profile...</div>; }
  if (!profile) { return <div className="text-center py-20"><h2>User not found.</h2></div>; }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-8 rounded-2xl shadow-md mb-8">
            <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-8">
                    {profile.profilePictureUrl ? (
                        <img 
                            src={profile.profilePictureUrl} 
                            alt={`${profile.username}'s profile`} 
                            className="h-32 w-32 rounded-full object-cover border-4 border-indigo-100"
                        />
                    ) : (
                        <div className="h-32 w-32 rounded-full bg-indigo-500 flex items-center justify-center text-white text-5xl font-bold">
                            {profile.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{profile.username}</h1>
                            {profile.location && (
                                <p className="text-md text-gray-500 mt-1 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {profile.location}
                                </p>
                            )}
                            <div className="mt-2 bg-orange-100 text-orange-600 font-bold px-3 py-1 rounded-full flex items-center w-fit">
                                {profile.streak || 0} <span className="ml-1.5 text-lg">🔥</span>
                            </div>
                        </div>
                        {isMyProfile && (
                            <button 
                                onClick={() => setActiveTab('edit')}
                                className="mt-4 md:mt-0 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors flex items-center self-start"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </button>
                        )}
                    </div>
                    
                    {profile.bio && (
                        <p className="mt-4 text-gray-700">{profile.bio}</p>
                    )}
                    
                    {/* Social Links */}
                    {profile.socialLinks && Object.values(profile.socialLinks).some(link => link && link.trim() !== '') && (
                        <div className="mt-4 flex space-x-4">
                            {profile.socialLinks.twitter && (
                                <a href={`https://twitter.com/${profile.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                    </svg>
                                </a>
                            )}
                            {profile.socialLinks.instagram && (
                                <a href={`https://instagram.com/${profile.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </a>
                            )}
                            {profile.socialLinks.facebook && (
                                <a href={`https://facebook.com/${profile.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                            )}
                            {profile.socialLinks.linkedin && (
                                <a href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            )}
                            {profile.socialLinks.website && (
                                <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Progress</h2>
                <p className="text-sm text-gray-500">Level {level}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 my-2">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                </div>
                <p className="text-right text-sm font-semibold text-gray-700">{profile.xp || 0} XP</p>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Badges</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {profile.badges && profile.badges.length > 0 ? (
                        profile.badges.map(badgeName => <BadgeCard key={badgeName} badgeName={badgeName} />)
                    ) : (
                        <p className="col-span-full text-center text-gray-500 py-4">No badges earned yet.</p>
                    )}
                </div>
            </div>
        </div>

        <div>
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('posts')} className={`${activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Posts</button>
                    {isMyProfile && (<button onClick={() => setActiveTab('saved')} className={`${activeTab === 'saved' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Saved Posts</button>)}
                    {isMyProfile && (<button onClick={() => setActiveTab('shared')} className={`${activeTab === 'shared' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Shared Posts</button>)}
                    {isMyProfile && (<button onClick={() => setActiveTab('edit')} className={`${activeTab === 'edit' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Edit Profile</button>)}
                </nav>
            </div>
            <div className="space-y-6">
                {activeTab === 'posts' && (
                    userPosts.length > 0 ? userPosts.map(post => <PostCard key={post._id} post={post} />) 
                    : <p className="text-center text-gray-500 py-10">This user hasn't posted.</p>
                )}
                {activeTab === 'saved' && isMyProfile && (
                    myProfile?.savedPosts && myProfile.savedPosts.length > 0 ? myProfile.savedPosts.map(post => <PostCard key={post._id} post={post} />) 
                    : <p className="text-center text-gray-500 py-10">You have no saved posts.</p>
                )}
                {activeTab === 'shared' && isMyProfile && (
                    myProfile?.sharedPosts && myProfile.sharedPosts.length > 0 ? myProfile.sharedPosts.map(post => <PostCard key={post._id} post={post} />) 
                    : <p className="text-center text-gray-500 py-10">You haven't shared any posts yet.</p>
                )}
                {activeTab === 'edit' && isMyProfile && (
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            {/* Profile Picture URL */}
                            <div>
                                <label htmlFor="profilePictureUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                    Profile Picture URL
                                </label>
                                <input
                                    type="text"
                                    id="profilePictureUrl"
                                    name="profilePictureUrl"
                                    value={profileForm.profilePictureUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="https://example.com/your-image.jpg"
                                />
                                {profileForm.profilePictureUrl && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 mb-1">Preview:</p>
                                        <img 
                                            src={profileForm.profilePictureUrl} 
                                            alt="Profile preview" 
                                            className="h-20 w-20 rounded-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {/* Bio */}
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    id="bio"
                                    name="bio"
                                    value={profileForm.bio}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                            
                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={profileForm.location}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="City, Country"
                                />
                            </div>
                            
                            {/* Social Links */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-3">Social Media Links</h3>
                                
                                {/* Twitter */}
                                <div className="mb-3">
                                    <label htmlFor="social-twitter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Twitter Username
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            id="social-twitter"
                                            name="social-twitter"
                                            value={profileForm.socialLinks.twitter}
                                            onChange={handleInputChange}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                                
                                {/* Instagram */}
                                <div className="mb-3">
                                    <label htmlFor="social-instagram" className="block text-sm font-medium text-gray-700 mb-1">
                                        Instagram Username
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            id="social-instagram"
                                            name="social-instagram"
                                            value={profileForm.socialLinks.instagram}
                                            onChange={handleInputChange}
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                                
                                {/* Facebook */}
                                <div className="mb-3">
                                    <label htmlFor="social-facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                        Facebook Username
                                    </label>
                                    <input
                                        type="text"
                                        id="social-facebook"
                                        name="social-facebook"
                                        value={profileForm.socialLinks.facebook}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="username or profile ID"
                                    />
                                </div>
                                
                                {/* LinkedIn */}
                                <div className="mb-3">
                                    <label htmlFor="social-linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                                        LinkedIn Username
                                    </label>
                                    <input
                                        type="text"
                                        id="social-linkedin"
                                        name="social-linkedin"
                                        value={profileForm.socialLinks.linkedin}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="username"
                                    />
                                </div>
                                
                                {/* Website */}
                                <div>
                                    <label htmlFor="social-website" className="block text-sm font-medium text-gray-700 mb-1">
                                        Personal Website
                                    </label>
                                    <input
                                        type="text"
                                        id="social-website"
                                        name="social-website"
                                        value={profileForm.socialLinks.website}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                            
                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('posts')}
                                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
    </ClientOnly>
  );
}
