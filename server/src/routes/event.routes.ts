// server/src/routes/event.routes.ts

import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  regenerateAIContent,
  sendTestMessage,
  getUpcomingReminders
} from '../controllers/event.controller';

const router = express.Router();

// All routes are protected with authentication
router.use(protect);

// Event routes
router.route('/')
  .post(createEvent)
  .get(getEvents);

router.route('/reminders')
  .get(getUpcomingReminders);

router.route('/:id')
  .get(getEventById)
  .put(updateEvent)
  .delete(deleteEvent);

router.route('/:id/regenerate')
  .post(regenerateAIContent);

router.route('/:id/test-message')
  .post(sendTestMessage);

export default router;