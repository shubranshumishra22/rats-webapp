// client/src/app/community/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow, isFuture, isToday } from 'date-fns';
import Link from 'next/link';
import ClientOnly from '@/components/ClientOnly';

// --- TYPE DEFINITIONS ---
interface Author { _id: string; username: string; }
interface Comment { _id: string; user: Author; text: string; createdAt: string; }
interface Post { 
  _id: string; author: Author; content: string; likes: string[]; comments: Comment[]; createdAt: string;
  type: 'general' | 'event'; eventDate?: string; location?: string; imageUrl?: string; linkUrl?: string;
  sharedFrom?: Post; // Reference to the original post if this is a shared post
}
interface UserProfile { _id: string; username: string; email: string; savedPosts: Post[]; }

// --- Reusable Post Card Component ---
const PostCard = ({ post, myId, ...handlers }: { post: Post; myId: string | null; [key: string]: any }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const isLikedByMe = myId && post.likes ? post.likes.includes(myId) : false;
  const isSavedByMe = handlers.savedPostIds && post._id ? handlers.savedPostIds.includes(post._id) : false;

  const onCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!commentText.trim() || !post._id || !handlers.handleAddComment) return;
    
    handlers.handleAddComment(post._id, commentText);
    setCommentText(''); 
    setShowComments(true);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center mb-3">
        {post.author && post.author.username ? (
          <Link href={`/profile/${post.author.username}`} className="flex items-center group">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {post.author.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-bold text-gray-800 group-hover:text-blue-600">{post.author.username}</p>
              {post.createdAt && (
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              )}
            </div>
          </Link>
        ) : (
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">?</div>
            <div className="ml-3">
              <p className="font-bold text-gray-800">Unknown User</p>
            </div>
          </div>
        )}
      </div>

      {/* Show shared post info if this is a shared post */}
      {post.sharedFrom && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500 mb-2">
            <span className="font-medium">{post.author?.username}</span> shared a post from{' '}
            {post.sharedFrom.author && (
              <Link href={`/profile/${post.sharedFrom.author.username}`} className="text-blue-600 hover:underline">
                {post.sharedFrom.author.username}
              </Link>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content || 'No content'}</p>
        </div>
      )}
      
      {/* Show regular content if not a shared post */}
      {!post.sharedFrom && (
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content || 'No content'}</p>
      )}

      {post.type === 'event' && (
        <div className="mb-4 border border-gray-200 rounded-lg p-4 space-y-3">
            {post.imageUrl && <img src={post.imageUrl} alt="Event" className="w-full h-48 object-cover rounded-md" />}
            {post.eventDate && (
              <div className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="font-semibold">
                    {format(new Date(post.eventDate), 'PPPP, p')}
                  </span>
              </div>
            )}
            {post.location && (
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {post.location}
              </div>
            )}
            {post.linkUrl && (
              <div className="flex items-center text-sm">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                <a href={post.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">More Info / RSVP</a>
              </div>
            )}
        </div>
      )}

      {/* --- IMPROVED UI FOR ACTION BUTTONS --- */}
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex space-x-5 items-center">
          <button 
            onClick={() => post._id && handlers.handleLikePost && handlers.handleLikePost(post._id)} 
            className={`flex items-center text-sm font-semibold transition-colors ${isLikedByMe ? 'text-rose-500' : 'text-gray-500 hover:text-rose-500'}`}
          >
            <svg className="w-5 h-5 mr-1.5" fill={isLikedByMe ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
            {post.likes ? post.likes.length : 0}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center text-sm text-gray-500 hover:text-blue-600 font-semibold">
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            {post.comments ? post.comments.length : 0}
          </button>
          {/* Share button - only show if not the author and not already shared */}
          {post.author && myId && post.author._id !== myId && !post.sharedFrom && (
            <button 
              onClick={() => post._id && handlers.handleSharePost && handlers.handleSharePost(post._id)} 
              className="flex items-center text-sm text-gray-500 hover:text-green-600 font-semibold"
            >
              <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>
        <div className="flex space-x-3 items-center">
          <button 
            onClick={() => post._id && handlers.handleSavePost && handlers.handleSavePost(post._id)} 
            className={`flex items-center text-sm font-semibold transition-colors ${isSavedByMe ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            <svg className="w-5 h-5" fill={isSavedByMe ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          </button>
          
          {/* Delete button - only show if author */}
          {post.author && myId && post.author._id === myId && (
            <button 
              onClick={() => post._id && handlers.handleDeletePost && handlers.handleDeletePost(post._id)} 
              className="flex items-center text-sm text-gray-500 hover:text-red-600 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <form onSubmit={onCommentSubmit} className="flex items-center gap-2 mb-4">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-grow px-3 py-2 text-sm border border-gray-300 rounded-full"/>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 text-sm font-semibold rounded-full">Post</button>
          </form>
          <div className="space-y-3">
            {post.comments && post.comments.length > 0 ? post.comments.map(comment => (
              comment && comment._id && comment.user ? (
                <div key={comment._id} className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                    {comment.user.username ? comment.user.username.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="ml-2 bg-gray-100 p-2 rounded-lg">
                    {comment.user.username && (
                      <Link href={`/profile/${comment.user.username}`} className="font-semibold text-sm text-gray-800 hover:underline">
                        {comment.user.username}
                      </Link>
                    )}
                    <p className="text-sm text-gray-600">{comment.text}</p>
                  </div>
                </div>
              ) : null
            )) : (
              <p className="text-sm text-gray-500">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'general' | 'event'>('general');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  
  const [myId, setMyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getAuthHeaders = useCallback(() => { 
    const token = localStorage.getItem('rats_token');
    console.log('Auth token:', token ? 'Token exists' : 'No token found');
    return { headers: { Authorization: `Bearer ${token}` } }; 
  }, []);
  const fetchData = useCallback(async () => {
    try {
      const [postsRes, profileRes] = await Promise.all([
        axios.get('http://localhost:5001/api/posts', getAuthHeaders()),
        axios.get('http://localhost:5001/api/users/profile/me', getAuthHeaders())
      ]);
      setPosts(postsRes.data);
      setProfile(profileRes.data);
    } catch (error) { console.error('Failed to fetch data:', error); } 
    finally { setIsLoading(false); }
  }, [getAuthHeaders]);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('rats_token');
    if (!token) { 
      router.push('/login'); 
      return; 
    }
    
    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      const expiry = decodedToken.exp * 1000; // Convert to milliseconds
      if (Date.now() >= expiry) {
        console.log('Token expired, redirecting to login');
        localStorage.removeItem('rats_token');
        router.push('/login');
        return;
      }
      
      setMyId(decodedToken.id);
      fetchData();
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('rats_token');
      router.push('/login');
    }
  }, [router, fetchData]);

  const upcomingEvents = useMemo(() => {
    if (!profile?.savedPosts || !Array.isArray(profile.savedPosts)) return [];
    return profile.savedPosts
      .filter(post => post && post.type === 'event' && post.eventDate && (isFuture(new Date(post.eventDate)) || isToday(new Date(post.eventDate))))
      .sort((a, b) => {
        if (!a.eventDate || !b.eventDate) return 0;
        return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
      });
  }, [profile]);

  // Direct post function without form event
  const createPostDirectly = async () => {
    console.log('Creating post directly');
    
    if (!newPostContent.trim()) {
      console.log('Post content is empty');
      alert('Please enter some content for your post');
      return;
    }
    
    const postData: any = { content: newPostContent, type: postType };
    console.log('Direct post data:', postData);
    
    if (postType === 'event') {
      if(!eventDate) {
        console.log('Event date is required but missing');
        alert("Please set a date for the event.");
        return;
      }
      postData.eventDate = eventDate;
      if(location) postData.location = location;
      if(imageUrl) postData.imageUrl = imageUrl;
      if(linkUrl) postData.linkUrl = linkUrl;
      
      console.log('Direct event post data:', postData);
    }
    
    try {
      console.log('Sending direct API request with data:', postData);
      
      const response = await axios.post('http://localhost:5001/api/posts', postData, getAuthHeaders());
      
      console.log('Direct API response:', response);
      
      if (response && response.data) {
        console.log('Direct response data:', response.data);
        
        setPosts(prevPosts => [response.data, ...(prevPosts || [])]);
        
        setNewPostContent(''); 
        setPostType('general'); 
        setEventDate(''); 
        setLocation(''); 
        setImageUrl(''); 
        setLinkUrl('');
        
        alert('Post created successfully!');
      }
    } catch (error: any) { 
      console.error('Error creating post directly:', error);
      alert(`Could not create post: ${error.response?.data?.message || error.message}`); 
    }
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted');
    
    if (!newPostContent.trim()) {
      console.log('Post content is empty');
      return;
    }
    
    const postData: any = { content: newPostContent, type: postType };
    console.log('Post data initial:', postData);
    
    if (postType === 'event') {
        if(!eventDate) {
          console.log('Event date is required but missing');
          alert("Please set a date for the event.");
          return;
        }
        postData.eventDate = eventDate;
        if(location) postData.location = location;
        if(imageUrl) postData.imageUrl = imageUrl;
        if(linkUrl) postData.linkUrl = linkUrl;
        
        console.log('Event post data:', postData);
    }
    try {
      console.log('Sending API request with data:', postData);
      console.log('Auth headers:', getAuthHeaders());
      
      const response = await axios.post('http://localhost:5001/api/posts', postData, getAuthHeaders());
      
      console.log('API response:', response);
      
      // Make sure we have a valid response
      if (response && response.data) {
        console.log('Response data:', response.data);
        
        // Add the new post to the beginning of the posts array
        setPosts(prevPosts => {
          console.log('Previous posts:', prevPosts);
          const newPosts = [response.data, ...(prevPosts || [])];
          console.log('New posts array:', newPosts);
          return newPosts;
        });
        
        // Reset all form fields
        setNewPostContent(''); 
        setPostType('general'); 
        setEventDate(''); 
        setLocation(''); 
        setImageUrl(''); 
        setLinkUrl('');
        
        console.log('Post created successfully:', response.data);
      }
    } catch (error: any) { 
      console.error('Error creating post:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Could not create post: ${error.response?.data?.message || error.message}`); 
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!posts || !Array.isArray(posts) || !myId) return;
    
    setPosts(posts.map(p => {
      if (p && p._id === postId) {
        const likes = p.likes || [];
        const isLiked = likes.includes(myId);
        
        return { 
          ...p, 
          likes: isLiked 
            ? likes.filter(id => id !== myId) 
            : [...likes, myId] 
        };
      }
      return p;
    }));
    
    try { 
      await axios.put(`http://localhost:5001/api/posts/${postId}/like`, {}, getAuthHeaders()); 
    } catch (error) { 
      fetchData(); 
    }
  };

  const handleSavePost = async (postId: string) => {
    if (!profile || !profile.savedPosts || !Array.isArray(profile.savedPosts)) return;
    
    const isSaved = profile.savedPosts.some(p => p && p._id === postId);
    const postToAdd = posts.find(p => p && p._id === postId);
    
    if (isSaved) {
      setProfile({ 
        ...profile, 
        savedPosts: profile.savedPosts.filter(p => p && p._id !== postId) 
      });
    } else if (postToAdd) {
      setProfile({ 
        ...profile, 
        savedPosts: [...profile.savedPosts, postToAdd] 
      });
    }
    
    try { 
      await axios.put(`http://localhost:5001/api/posts/${postId}/save`, {}, getAuthHeaders()); 
    } catch (error) { 
      fetchData(); 
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    if (!posts || !Array.isArray(posts)) return;
    
    try {
      const res = await axios.post(`http://localhost:5001/api/posts/${postId}/comment`, { text }, getAuthHeaders());
      if (res && res.data) {
        setPosts(posts.map(p => (p && p._id === postId) ? res.data : p));
      }
    } catch (error) { 
      alert('Could not comment.'); 
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!posts || !Array.isArray(posts)) return;
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5001/api/posts/${postId}`, getAuthHeaders());
      // Remove the post from the UI
      setPosts(posts.filter(p => p && p._id !== postId));
      alert('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Could not delete post. Please try again.');
    }
  };
  
  const handleSharePost = async (postId: string) => {
    if (!posts || !Array.isArray(posts)) return;
    
    try {
      const res = await axios.post(`http://localhost:5001/api/posts/${postId}/share`, {}, getAuthHeaders());
      if (res && res.data) {
        // Add the new shared post to the top of the feed
        setPosts([res.data, ...posts]);
        alert('Post shared successfully!');
      }
    } catch (error: any) {
      console.error('Error sharing post:', error);
      alert(error.response?.data?.message || 'Could not share post. Please try again.');
    }
  };

  if (isLoading) { return <div className="flex justify-center items-center min-h-screen">Loading...</div>; }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            {/* --- THE FIX IS HERE --- */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
                {profile && (
                    <Link href={`/profile/${profile.username}`} className="bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-gray-100 transition">
                        Your Profile
                    </Link>
                )}
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <form onSubmit={handleCreatePost}>
                 <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder={`What's on your mind, ${profile?.username}?`} className="w-full p-3 border rounded-lg" rows={3}/>
                 <div className="my-4"><div className="flex items-center gap-4"><button type="button" onClick={() => setPostType('general')} className={`px-4 py-2 text-sm font-semibold rounded-full ${postType === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>General</button><button type="button" onClick={() => setPostType('event')} className={`px-4 py-2 text-sm font-semibold rounded-full ${postType === 'event' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Event</button></div></div>
                 {postType === 'event' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 p-4 border-t">
                        <div><label className="block text-sm">Event Date & Time*</label><input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} required className="mt-1 w-full p-2 border rounded-md"/></div>
                        <div><label className="block text-sm">Location</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Central Park" className="mt-1 w-full p-2 border rounded-md"/></div>
                        <div className="md:col-span-2"><label className="block text-sm">Image URL</label><input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full p-2 border rounded-md"/></div>
                        <div className="md:col-span-2"><label className="block text-sm">Link for more info</label><input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full p-2 border rounded-md"/></div>
                    </div>
                 )}
                 <div className="flex justify-end items-center mt-3">
                   <button 
                     type="submit" 
                     className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                     onClick={(e) => {
                       console.log('Post button clicked');
                     }}
                   >
                     Post
                   </button>
                 </div>
              </form>
            </div>
            <div className="space-y-6">
              {posts && posts.length > 0 ? posts.map(post => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  myId={myId} 
                  {...{ handleLikePost, handleSavePost, handleAddComment, handleDeletePost, handleSharePost }} 
                  savedPostIds={profile?.savedPosts?.map(p => p._id) || []} 
                />
              )) : (
                <p className="text-center text-gray-500 py-10">No posts available.</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1 space-y-6 sticky top-24">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Your Upcoming Events</h2>
              <div className="space-y-4">
                {upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents.map(event => (
                  <div key={event._id} className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                    <p className="font-semibold text-blue-800">{event.content}</p>
                    {event.eventDate && (
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.eventDate), 'E, MMM d')} at {format(new Date(event.eventDate), 'p')}
                      </p>
                    )}
                    {event.author && event.author.username && (
                      <p className="text-xs text-gray-500">by {event.author.username}</p>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-gray-500">You have no saved upcoming events.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </ClientOnly>
  );
}
