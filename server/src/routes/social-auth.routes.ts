// server/src/routes/social-auth.routes.ts

import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  getInstagramAuthUrl,
  handleInstagramCallback,
  disconnectInstagram,
  getConnectedSocialAccounts
} from '../controllers/social-auth.controller';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Instagram OAuth routes
router.get('/instagram/auth-url', getInstagramAuthUrl);
router.get('/instagram/callback', handleInstagramCallback);
router.delete('/instagram/disconnect', disconnectInstagram);

// Get all connected social accounts
router.get('/connected-accounts', getConnectedSocialAccounts);

export default router;