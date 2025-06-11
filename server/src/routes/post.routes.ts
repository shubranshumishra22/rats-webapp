// server/src/routes/post.routes.ts

import express from 'express';
// Import all controller functions, including the new addComment
import { 
  createPost, 
  getAllPosts, 
  likePost, 
  savePost, 
  addComment, 
  deletePost,
  sharePost 
} from '../controllers/post.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Routes for creating a post and getting the main feed
router.route('/')
  .post(protect, createPost)
  .get(protect, getAllPosts);

// Route for liking or unliking a post
router.route('/:id/like')
  .put(protect, likePost);

// Route for saving or unsaving a post
router.route('/:id/save')
  .put(protect, savePost);

// Route for adding a comment to a post
router.route('/:id/comment')
  .post(protect, addComment);

// Route for deleting a post
router.route('/:id')
  .delete(protect, deletePost);

// Route for sharing a post
router.route('/:id/share')
  .post(protect, sharePost);

export default router;
