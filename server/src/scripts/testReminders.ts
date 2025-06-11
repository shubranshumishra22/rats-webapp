// server/src/scripts/testReminders.ts
// A script to test the event reminder functionality

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { processEventReminders } from '../services/reminder.service';

dotenv.config();

async function testReminderService() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Process reminders
    console.log('Processing event reminders...');
    await processEventReminders();
    console.log('Reminder processing complete');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing reminder service:', error);
  }
}

// Run the test
testReminderService();