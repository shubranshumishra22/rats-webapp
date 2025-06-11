// server/src/server.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import { initScheduledTasks } from './services/scheduler.service';

// --- ROUTE IMPORTS ---
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import wellnessRoutes from './routes/wellness.routes';
import aiRoutes from './routes/ai.routes';
import foodRoutes from './routes/food.routes';
import userRoutes from './routes/user.routes'; // Only one import now
import postRoutes from './routes/post.routes';
import meditationRoutes from './routes/meditation.routes';
import eventRoutes from './routes/event.routes';
import socialAuthRoutes from './routes/social-auth.routes';
import nutritionRoutes from './routes/nutrition.routes'; // New nutrition routes


// --- INITIALIZATION ---
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;


// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// --- API ROUTES ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'RATS server is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/meditation', meditationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/social-auth', socialAuthRoutes);
app.use('/api/nutrition', nutritionRoutes); // Add new nutrition routes


// --- SERVER LISTENER ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  
  // Initialize scheduled tasks
  initScheduledTasks();
  console.log('📅 Scheduled tasks initialized');
});
