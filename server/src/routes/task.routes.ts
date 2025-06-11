// server/src/routes/task.routes.ts

import express from 'express';
import {
  createTask,
  updateTask,
  deleteTask,
  inviteCollaborator,
  acceptInvite,
  rejectInvite,
  requestJoinPublicTask,
  getDashboardData, // <-- Import the new dashboard controller
  acceptCollaborationRequest
} from '../controllers/task.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// --- NEW DASHBOARD ROUTE ---
// This single endpoint now provides all necessary data for the dashboard
router.route('/dashboard').get(protect, getDashboardData);


// --- Other Task-related routes ---
router.route('/').post(protect, createTask);
router.route('/:id').put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/invite').post(protect, inviteCollaborator);
router.route('/:id/accept').post(protect, acceptInvite);
router.route('/:id/reject').post(protect, rejectInvite);
router.route('/:id/request-join').post(protect, requestJoinPublicTask);
router.route('/:id/accept-collab').post(protect, acceptCollaborationRequest);

export default router;
