// server/src/controllers/social-auth.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import * as socialMediaService from '../services/social-media.service';

/**
 * @desc    Get Instagram authorization URL
 * @route   GET /api/social-auth/instagram/auth-url
 * @access  Private
 */
export const getInstagramAuthUrl = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  
  // Generate Instagram auth URL
  const authUrl = socialMediaService.getInstagramAuthUrl(userId.toString());
  
  res.status(200).json({
    success: true,
    authUrl
  });
});

/**
 * @desc    Handle Instagram OAuth callback
 * @route   GET /api/social-auth/instagram/callback
 * @access  Private
 */
export const handleInstagramCallback = asyncHandler(async (req: Request, res: Response) => {
  const { code, state } = req.query;
  
  if (!code || !state) {
    res.status(400);
    throw new Error('Missing required parameters');
  }
  
  try {
    // Decode state parameter to get user ID
    const decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
    const userId = decodedState.userId;
    
    // Verify that the user ID matches the logged-in user
    if (userId !== req.user!._id.toString()) {
      res.status(401);
      throw new Error('Unauthorized');
    }
    
    // Exchange code for access token
    const { access_token, user_id } = await socialMediaService.exchangeInstagramCode(code as string);
    
    // Get long-lived access token
    const longLivedToken = await socialMediaService.getLongLivedToken(access_token);
    
    // Save Instagram credentials to user profile
    await socialMediaService.saveInstagramCredentials(userId, user_id, longLivedToken);
    
    // Redirect to success page
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/social-accounts?connected=instagram`);
  } catch (error) {
    console.error('Instagram callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/settings/social-accounts?error=instagram_auth_failed`);
  }
});

/**
 * @desc    Disconnect Instagram account
 * @route   DELETE /api/social-auth/instagram/disconnect
 * @access  Private
 */
export const disconnectInstagram = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  
  // Remove Instagram credentials from user profile
  await User.findByIdAndUpdate(userId, {
    $unset: { 'socialMediaAuth.instagram': 1 }
  });
  
  res.status(200).json({
    success: true,
    message: 'Instagram account disconnected successfully'
  });
});

/**
 * @desc    Get all connected social accounts
 * @route   GET /api/social-auth/connected-accounts
 * @access  Private
 */
export const getConnectedSocialAccounts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  
  // Get user with social media auth info
  const user = await User.findById(userId).select('socialMediaAuth');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  // Prepare response with connected accounts
  const connectedAccounts = {
    instagram: !!user.socialMediaAuth?.instagram?.accessToken,
    facebook: !!user.socialMediaAuth?.facebook?.accessToken,
    twitter: !!user.socialMediaAuth?.twitter?.accessToken
  };
  
  res.status(200).json({
    success: true,
    connectedAccounts
  });
});