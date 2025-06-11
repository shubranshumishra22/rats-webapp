// server/src/controllers/post.controller.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Post from '../models/post.model';
import User from '../models/user.model';
import { checkAndAwardBadges } from '../services/badge.service'; // <-- Import badge service

/**
 * @desc    Create a new post (and award XP/Badges)
 * @route   POST /api/posts
 * @access  Private
 */
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  console.log('Create post request received:', req.body);
  console.log('User:', req.user);
  
  const { content, type, eventDate, location, imageUrl, linkUrl } = req.body;

  if (!content || content.trim() === '') {
    console.log('Post content is empty');
    res.status(400);
    throw new Error('Post content cannot be empty.');
  }

  // Create post object with all possible fields
  const postData: any = {
    author: req.user!._id,
    content,
    type: type || 'general'
  };

  console.log('Initial post data:', postData);

  // Add event-specific fields if they exist
  if (type === 'event') {
    console.log('Creating event post');
    if (eventDate) postData.eventDate = eventDate;
    if (location) postData.location = location;
    if (imageUrl) postData.imageUrl = imageUrl;
    if (linkUrl) postData.linkUrl = linkUrl;
    console.log('Event post data:', postData);
  }

  console.log('Creating post with data:', postData);
  const post = await Post.create(postData);
  console.log('Post created:', post);

  // --- XP & BADGE LOGIC ---
  const user = await User.findById(req.user!._id);
  let newBadges: any[] = [];
  if (user) {
    user.xp = (user.xp || 0) + 15; // Award 15 XP for creating a post
    newBadges = await checkAndAwardBadges(user); // This will save the user if a badge is awarded
    
    // Save user if only XP was added and no new badges
    if (newBadges.length === 0) {
        await user.save();
    }
  }
  // --- END OF LOGIC ---


  console.log('Populating post data');
  const populatedPost = await Post.findById(post._id)
    .populate('author', 'username profilePictureUrl')
    .populate('comments.user', 'username profilePictureUrl');
  
  console.log('Populated post:', populatedPost);
  
  // Send back the new post and any new badges
  res.status(201).json(populatedPost);
});


/**
 * @desc    Get all posts for the community feed
 * @route   GET /api/posts
 * @access  Private
 */
export const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find({})
    .populate('author', 'username profilePictureUrl')
    .populate('comments.user', 'username profilePictureUrl')
    .populate({
        path: 'sharedFrom',
        populate: {
            path: 'author',
            select: 'username'
        }
    })
    .sort({ createdAt: -1 });

  res.status(200).json(posts);
});


/**
 * @desc    Like or unlike a post
 * @route   PUT /api/posts/:id/like
 * @access  Private
 */
export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  const userId = req.user!._id;

  if (!post) {
    res.status(404); throw new Error('Post not found');
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    await Post.updateOne({ _id: req.params.id }, { $pull: { likes: userId } });
  } else {
    await Post.updateOne({ _id: req.params.id }, { $push: { likes: userId } });
  }
  
  const updatedPost = await Post.findById(req.params.id).populate('author', 'username profilePictureUrl');
  res.status(200).json(updatedPost);
});


/**
 * @desc    Save or unsave a post
 * @route   PUT /api/posts/:id/save
 * @access  Private
 */
export const savePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.params.id;
  const user = await User.findById(req.user!._id);

  if (!user) {
    res.status(404); throw new Error('User not found');
  }

  const isSaved = user.savedPosts?.includes(postId as any);

  if (isSaved) {
    await User.updateOne({ _id: user._id }, { $pull: { savedPosts: postId } });
  } else {
    await User.updateOne({ _id: user._id }, { $addToSet: { savedPosts: postId } });
  }

  const updatedUser = await User.findById(user._id).select('savedPosts');
  res.status(200).json(updatedUser);
});


/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404); throw new Error('Post not found');
    }
    if (!text || text.trim() === '') {
        res.status(400); throw new Error('Comment text cannot be empty.');
    }

    const comment = { user: req.user!._id, text: text, createdAt: new Date() };
    post.comments.push(comment as any);
    await post.save();
    
    const updatedPost = await Post.findById(post._id)
      .populate('author', 'username profilePictureUrl')
      .populate('comments.user', 'username profilePictureUrl');

    res.status(201).json(updatedPost);
});


/**
 * @desc    Share/Re-post a post
 * @route   POST /api/posts/:id/share
 * @access  Private
 */
export const sharePost = asyncHandler(async (req: Request, res: Response) => {
    const originalPost = await Post.findById(req.params.id);
    const user = await User.findById(req.user!._id);

    if (!originalPost || !user) {
        res.status(404); throw new Error('Resource not found.');
    }
    if (originalPost.author.toString() === user._id.toString()) {
        res.status(400); throw new Error("You cannot share your own post.");
    }
    const alreadyShared = await Post.findOne({ author: user._id, sharedFrom: originalPost._id });
    if (alreadyShared) {
        res.status(400); throw new Error("You have already shared this post.");
    }

    const sharedPost = new Post({
        author: user._id, content: originalPost.content, type: originalPost.type, sharedFrom: originalPost._id,
        eventDate: originalPost.eventDate, location: originalPost.location, imageUrl: originalPost.imageUrl, linkUrl: originalPost.linkUrl,
    });
    await sharedPost.save();

    await User.findByIdAndUpdate(user._id, { $push: { sharedPosts: sharedPost._id } });
    
    const populatedPost = await Post.findById(sharedPost._id)
        .populate('author', 'username profilePictureUrl')
        .populate({
            path: 'sharedFrom',
            populate: { path: 'author', select: 'username' }
        });

    res.status(201).json(populatedPost);
});

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    
    // Check if the user is the author of the post
    if (post.author.toString() !== req.user!._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to delete this post');
    }
    
    // Find and delete any shared posts that reference this post
    await Post.deleteMany({ sharedFrom: post._id });
    
    // Remove this post from any users who saved it
    await User.updateMany(
        { savedPosts: post._id },
        { $pull: { savedPosts: post._id } }
    );
    
    // Remove this post from any users who shared it
    await User.updateMany(
        { sharedPosts: post._id },
        { $pull: { sharedPosts: post._id } }
    );
    
    // Delete the post
    await Post.deleteOne({ _id: post._id });
    
    res.status(200).json({ message: 'Post deleted successfully' });
});
