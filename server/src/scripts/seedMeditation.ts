// server/src/scripts/seedMeditation.ts

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { seedMeditationData } from '../data/meditationSeeds';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wellness-hub');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

// Main function
const seedDatabase = async () => {
  try {
    // Connect to database
    const conn = await connectDB();
    
    // Seed meditation data
    await seedMeditationData();
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error}`);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();