// server/src/routes/wellness.routes.ts

import express from 'express';
import { logOrUpdateWellness, getTodaysWellnessLog } from '../controllers/wellness.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Secure the routes with our protect middleware
router.route('/').post(protect, logOrUpdateWellness);
router.route('/today').get(protect, getTodaysWellnessLog);

export default router;