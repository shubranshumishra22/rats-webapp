// server/src/controllers/user.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/user.model';
import Post from '../models/post.model'; // <-- Import the Post model

/**
 * @desc    Get the logged-in user's own full profile (with saved posts, xp, badges)
 * @route   GET /api/users/profile/me
 * @access  Private
 */
export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user!._id)
        // Include all profile fields
        .select('username email dailyCalorieGoal profilePictureUrl bio location socialLinks savedPosts sharedPosts streak xp badges')
        .populate({
            path: 'savedPosts',
            populate: { path: 'author', select: 'username' }
        })
        .populate({
            path: 'sharedPosts',
            populate: [
                { path: 'author', select: 'username' },
                { 
                    path: 'sharedFrom',
                    populate: { path: 'author', select: 'username' }
                }
            ]
        });
    
    if (user) {
        res.json(user);
    } else {
        res.status(404); throw new Error('User not found');
    }
});


/**
 * @desc    Get a user's public profile by their username
 * @route   GET /api/users/profile/:username
 * @access  Private
 */
export const getUserProfileByUsername = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
        // Include all public profile fields
        .select('username profilePictureUrl bio location socialLinks streak xp badges');

    if (user) {
        res.json(user);
    } else {
        res.status(404); throw new Error('User not found');
    }
});

/**
 * @desc    Get all posts created by a specific user
 * @route   GET /api/users/profile/:username/posts
 * @access  Private
 */
export const getUserPosts = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const posts = await Post.find({ author: user._id })
        .populate('author', 'username profilePictureUrl')
        .sort({ createdAt: -1 });

    res.json(posts);
});


/**
 * @desc    Update user's calorie goal
 * @route   PUT /api/users/goal
 * @access  Private
 */
export const updateUserGoal = asyncHandler(async (req: Request, res: Response) => {
    const { dailyCalorieGoal } = req.body;
    if (dailyCalorieGoal === undefined || dailyCalorieGoal < 0) {
        res.status(400); throw new Error('Please provide a valid calorie goal.');
    }
    const user = await User.findById(req.user!._id);
    if (user) {
        user.dailyCalorieGoal = dailyCalorieGoal;
        await user.save();
        res.status(200).json({ message: 'Goal updated successfully', dailyCalorieGoal: user.dailyCalorieGoal });
    } else {
        res.status(404); throw new Error('User not found');
    }
});

/**
 * @desc    Update user's profile information
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const { 
        profilePictureUrl, 
        bio, 
        location, 
        socialLinks 
    } = req.body;

    const user = await User.findById(req.user!._id);
    
    if (!user) {
        res.status(404); 
        throw new Error('User not found');
    }

    // Update fields if provided
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    
    // Update social links if provided
    if (socialLinks) {
        user.socialLinks = {
            ...user.socialLinks,
            ...socialLinks
        };
    }

    await user.save();
    
    // Return updated user profile
    const updatedUser = await User.findById(user._id)
        .select('username email profilePictureUrl bio location socialLinks');
    
    res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser
    });
});
