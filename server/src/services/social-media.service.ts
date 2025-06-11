// server/src/services/social-media.service.ts

import axios from 'axios';
import * as dotenv from 'dotenv';
import User from '../models/user.model';
import SocialMediaPost from '../models/social-media-post.model';

dotenv.config();

// Instagram API configuration
const INSTAGRAM_API_URL = 'https://graph.instagram.com/v18.0';
const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5001/api/auth/instagram/callback';

/**
 * Get Instagram OAuth URL for user authorization
 */
export function getInstagramAuthUrl(userId: string): string {
  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
  
  return `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=user_profile,user_media&response_type=code&state=${state}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeInstagramCode(code: string): Promise<{
  access_token: string;
  user_id: string;
}> {
  try {
    const response = await axios.post('https://api.instagram.com/oauth/access_token', {
      client_id: INSTAGRAM_CLIENT_ID,
      client_secret: INSTAGRAM_CLIENT_SECRET,
      grant_type: 'authorization_code',
      redirect_uri: INSTAGRAM_REDIRECT_URI,
      code
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error exchanging Instagram code:', error.response?.data || error.message);
    throw new Error('Failed to exchange Instagram authorization code');
  }
}

/**
 * Get long-lived access token (valid for 60 days)
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<string> {
  try {
    const response = await axios.get(`https://graph.instagram.com/access_token`, {
      params: {
        grant_type: 'ig_exchange_token',
        client_secret: INSTAGRAM_CLIENT_SECRET,
        access_token: shortLivedToken
      }
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting long-lived token:', error.response?.data || error.message);
    throw new Error('Failed to get long-lived Instagram token');
  }
}

/**
 * Save Instagram credentials to user profile
 */
export async function saveInstagramCredentials(
  userId: string,
  instagramUserId: string,
  accessToken: string
): Promise<void> {
  try {
    await User.findByIdAndUpdate(userId, {
      'socialMediaAuth.instagram': {
        userId: instagramUserId,
        accessToken,
        tokenExpiry: new Date(Date.now() + 59 * 24 * 60 * 60 * 1000) // 59 days
      }
    });
  } catch (error) {
    console.error('Error saving Instagram credentials:', error);
    throw new Error('Failed to save Instagram credentials');
  }
}

/**
 * Format message for Instagram
 * Instagram has specific requirements for post formatting
 */
export function formatInstagramMessage(message: string): string {
  // Instagram has a character limit of 2,200 for captions
  if (message.length > 2200) {
    message = message.substring(0, 2197) + '...';
  }
  
  // Replace multiple line breaks with just two (Instagram formatting)
  message = message.replace(/\n{3,}/g, '\n\n');
  
  // Add hashtags for better visibility
  const hashtags = '\n\n#RATS #SpecialEvent #Celebration';
  
  // Make sure we don't exceed the limit even with hashtags
  const maxLength = 2200 - hashtags.length;
  if (message.length > maxLength) {
    message = message.substring(0, maxLength - 3) + '...';
  }
  
  return message + hashtags;
}

/**
 * Post message to Instagram
 * Note: Instagram Graph API doesn't allow posting text-only content
 * We need to either post an image or a story
 */
export async function postToInstagram(
  userId: string,
  message: string,
  imageUrl?: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  try {
    // Get user's Instagram credentials
    const user = await User.findById(userId);
    if (!user?.socialMediaAuth?.instagram?.accessToken) {
      return { 
        success: false, 
        error: 'Instagram not connected. Please connect your Instagram account.' 
      };
    }
    
    const accessToken = user.socialMediaAuth.instagram.accessToken;
    
    // Format the message for Instagram
    const formattedMessage = formatInstagramMessage(message);
    
    // In a real implementation, we would:
    // 1. Upload an image to Instagram (required for posts)
    // 2. Create a media container with the caption
    // 3. Publish the media
    
    // For this demo, we'll simulate a successful post
    const simulatedPostId = `ig_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Save the post to our database for tracking
    const post = new SocialMediaPost({
      user: userId,
      platform: 'instagram',
      content: formattedMessage,
      platformPostId: simulatedPostId,
      status: 'published',
      publishedAt: new Date(),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
        impressions: 0
      }
    });
    
    await post.save();
    
    return {
      success: true,
      postId: simulatedPostId
    };
  } catch (error: any) {
    console.error('Error posting to Instagram:', error);
    return {
      success: false,
      error: error.message || 'Failed to post to Instagram'
    };
  }
}

/**
 * Schedule a post for Instagram
 * Note: Instagram doesn't have a native scheduling API, so we'll implement our own
 */
export async function scheduleInstagramPost(
  userId: string,
  message: string,
  scheduledDate: Date,
  imageUrl?: string
): Promise<{ success: boolean; scheduleId?: string; error?: string }> {
  try {
    // Check if user has Instagram connected
    const user = await User.findById(userId);
    if (!user?.socialMediaAuth?.instagram?.accessToken) {
      return { 
        success: false, 
        error: 'Instagram not connected. Please connect your Instagram account.' 
      };
    }
    
    // Format the message
    const formattedMessage = formatInstagramMessage(message);
    
    // Create a scheduled post record
    const scheduledPost = new SocialMediaPost({
      user: userId,
      platform: 'instagram',
      content: formattedMessage,
      imageUrl,
      status: 'scheduled',
      scheduledFor: scheduledDate
    });
    
    await scheduledPost.save();
    
    return {
      success: true,
      scheduleId: scheduledPost._id.toString()
    };
  } catch (error: any) {
    console.error('Error scheduling Instagram post:', error);
    return {
      success: false,
      error: error.message || 'Failed to schedule Instagram post'
    };
  }
}

/**
 * Get engagement metrics for an Instagram post
 */
export async function getInstagramPostMetrics(
  userId: string,
  postId: string
): Promise<{ 
  success: boolean; 
  metrics?: { 
    likes: number; 
    comments: number; 
    shares: number; 
    impressions: number; 
  }; 
  error?: string 
}> {
  try {
    // In a real implementation, we would:
    // 1. Get the user's Instagram access token
    // 2. Call the Instagram Insights API to get metrics
    
    // For this demo, we'll simulate metrics
    const post = await SocialMediaPost.findOne({
      user: userId,
      platformPostId: postId
    });
    
    if (!post) {
      return {
        success: false,
        error: 'Post not found'
      };
    }
    
    // Simulate some engagement metrics
    const simulatedMetrics = {
      likes: Math.floor(Math.random() * 50),
      comments: Math.floor(Math.random() * 10),
      shares: Math.floor(Math.random() * 5),
      impressions: Math.floor(Math.random() * 200) + 50
    };
    
    // Update the post with new metrics
    post.metrics = simulatedMetrics;
    await post.save();
    
    return {
      success: true,
      metrics: simulatedMetrics
    };
  } catch (error: any) {
    console.error('Error getting Instagram metrics:', error);
    return {
      success: false,
      error: error.message || 'Failed to get Instagram post metrics'
    };
  }
}

/**
 * Process scheduled posts that are due
 * This would be called by a scheduled job
 */
export async function processScheduledPosts(): Promise<void> {
  try {
    const now = new Date();
    
    // Find all scheduled posts that are due
    const duePosts = await SocialMediaPost.find({
      status: 'scheduled',
      scheduledFor: { $lte: now }
    }).populate('user');
    
    console.log(`Processing ${duePosts.length} scheduled social media posts`);
    
    for (const post of duePosts) {
      try {
        if (post.platform === 'instagram') {
          // In a real implementation, we would post to Instagram here
          // For now, we'll just update the status
          post.status = 'published';
          post.publishedAt = new Date();
          post.platformPostId = `ig_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          
          // Initialize metrics
          post.metrics = {
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0
          };
          
          await post.save();
          console.log(`Published scheduled Instagram post: ${post._id}`);
        }
      } catch (postError: any) {
        console.error(`Error publishing scheduled post ${post._id}:`, postError);
        post.status = 'failed';
        post.statusMessage = postError?.message || 'Unknown error occurred';
        await post.save();
      }
    }
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
  }
}