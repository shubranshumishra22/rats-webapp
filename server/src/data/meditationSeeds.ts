// server/src/data/meditationSeeds.ts

import mongoose from 'mongoose';
import Meditation from '../models/meditation.model';
import MeditationCourse from '../models/meditationCourse.model';
import SleepContent from '../models/sleepContent.model';

// Seed meditation data
export const seedMeditations = async () => {
  try {
    // Check if meditations already exist
    const meditationCount = await Meditation.countDocuments();
    if (meditationCount > 0) {
      console.log('Meditations already seeded');
      return;
    }

    // Create meditations
    const meditations = [
      {
        title: 'Morning Mindfulness',
        description: 'Start your day with clarity and purpose. This meditation helps you set positive intentions for the day ahead.',
        audioUrl: 'https://example.com/audio/morning-mindfulness.mp3',
        imageUrl: 'https://example.com/images/morning-mindfulness.jpg',
        duration: 5,
        category: 'focus',
        level: 'beginner',
        tags: ['morning', 'mindfulness', 'clarity'],
        isFeatured: true,
        isDownloadable: true,
        isPremium: false,
      },
      {
        title: 'Anxiety Relief',
        description: 'A gentle meditation to help calm anxiety and find your center during stressful moments.',
        audioUrl: 'https://example.com/audio/anxiety-relief.mp3',
        imageUrl: 'https://example.com/images/anxiety-relief.jpg',
        duration: 10,
        category: 'anxiety',
        level: 'beginner',
        tags: ['anxiety', 'stress', 'calm'],
        isFeatured: true,
        isDownloadable: true,
        isPremium: false,
      },
      {
        title: 'Deep Focus',
        description: 'Enhance your concentration and productivity with this focused attention meditation.',
        audioUrl: 'https://example.com/audio/deep-focus.mp3',
        imageUrl: 'https://example.com/images/deep-focus.jpg',
        duration: 15,
        category: 'focus',
        level: 'intermediate',
        tags: ['focus', 'concentration', 'productivity'],
        isFeatured: false,
        isDownloadable: true,
        isPremium: false,
      },
      {
        title: 'Loving-Kindness',
        description: 'Cultivate compassion for yourself and others with this heart-centered meditation.',
        audioUrl: 'https://example.com/audio/loving-kindness.mp3',
        imageUrl: 'https://example.com/images/loving-kindness.jpg',
        duration: 10,
        category: 'love',
        level: 'beginner',
        tags: ['compassion', 'love', 'kindness'],
        isFeatured: false,
        isDownloadable: true,
        isPremium: false,
      },
      {
        title: 'Sleep Preparation',
        description: 'Prepare your mind and body for restful sleep with this calming bedtime meditation.',
        audioUrl: 'https://example.com/audio/sleep-prep.mp3',
        imageUrl: 'https://example.com/images/sleep-prep.jpg',
        duration: 20,
        category: 'sleep',
        level: 'beginner',
        tags: ['sleep', 'relaxation', 'bedtime'],
        isFeatured: true,
        isDownloadable: true,
        isPremium: false,
      },
      {
        title: 'Advanced Body Scan',
        description: 'A detailed progressive relaxation meditation that guides you through each part of your body.',
        audioUrl: 'https://example.com/audio/body-scan.mp3',
        imageUrl: 'https://example.com/images/body-scan.jpg',
        duration: 25,
        category: 'calm',
        level: 'advanced',
        tags: ['body scan', 'relaxation', 'awareness'],
        isFeatured: false,
        isDownloadable: true,
        isPremium: true,
      },
      {
        title: 'Forgiveness Practice',
        description: 'Learn to let go of resentment and cultivate forgiveness toward yourself and others.',
        audioUrl: 'https://example.com/audio/forgiveness.mp3',
        imageUrl: 'https://example.com/images/forgiveness.jpg',
        duration: 15,
        category: 'forgiveness',
        level: 'intermediate',
        tags: ['forgiveness', 'healing', 'letting go'],
        isFeatured: false,
        isDownloadable: true,
        isPremium: true,
      },
      {
        title: 'Quick Calm',
        description: 'A brief meditation for moments when you need to quickly center yourself.',
        audioUrl: 'https://example.com/audio/quick-calm.mp3',
        imageUrl: 'https://example.com/images/quick-calm.jpg',
        duration: 3,
        category: 'calm',
        level: 'beginner',
        tags: ['quick', 'calm', 'reset'],
        isFeatured: true,
        isDownloadable: true,
        isPremium: false,
      },
    ];

    const createdMeditations = await Meditation.insertMany(meditations);
    console.log(`${createdMeditations.length} meditations created`);
    
    return createdMeditations;
  } catch (error) {
    console.error('Error seeding meditations:', error);
    throw error;
  }
};

// Seed meditation courses
export const seedMeditationCourses = async (meditations: any[] = []) => {
  try {
    // Check if courses already exist
    const courseCount = await MeditationCourse.countDocuments();
    if (courseCount > 0) {
      console.log('Meditation courses already seeded');
      return;
    }

    // If no meditations provided, fetch them
    let meditationDocs = meditations;
    if (meditationDocs.length === 0) {
      meditationDocs = await Meditation.find();
    }

    // Group meditations by level
    const beginnerMeditations = meditationDocs.filter(m => m.level === 'beginner');
    const intermediateMeditations = meditationDocs.filter(m => m.level === 'intermediate');
    const advancedMeditations = meditationDocs.filter(m => m.level === 'advanced');

    // Create courses
    const courses = [
      {
        title: 'Meditation Fundamentals',
        description: 'A comprehensive introduction to meditation for beginners. Learn the essential techniques to start your practice.',
        imageUrl: 'https://example.com/images/meditation-fundamentals.jpg',
        level: 'beginner',
        totalSessions: 5,
        meditations: beginnerMeditations.slice(0, 5).map(m => m._id),
        isPremium: false,
      },
      {
        title: 'Anxiety Management',
        description: 'A targeted course to help you manage anxiety and stress through meditation and mindfulness.',
        imageUrl: 'https://example.com/images/anxiety-management.jpg',
        level: 'beginner',
        totalSessions: 3,
        meditations: beginnerMeditations.filter(m => m.category === 'anxiety' || m.category === 'calm').map(m => m._id),
        isPremium: false,
      },
      {
        title: 'Advanced Mindfulness',
        description: 'Deepen your practice with advanced meditation techniques for experienced practitioners.',
        imageUrl: 'https://example.com/images/advanced-mindfulness.jpg',
        level: 'advanced',
        totalSessions: 2,
        meditations: advancedMeditations.map(m => m._id),
        isPremium: true,
      },
      {
        title: 'Emotional Balance',
        description: 'Learn to navigate difficult emotions and cultivate emotional resilience through meditation.',
        imageUrl: 'https://example.com/images/emotional-balance.jpg',
        level: 'intermediate',
        totalSessions: 4,
        meditations: intermediateMeditations.map(m => m._id),
        isPremium: true,
      },
    ];

    const createdCourses = await MeditationCourse.insertMany(courses);
    console.log(`${createdCourses.length} meditation courses created`);
  } catch (error) {
    console.error('Error seeding meditation courses:', error);
    throw error;
  }
};

// Seed sleep content
export const seedSleepContent = async () => {
  try {
    // Check if sleep content already exists
    const sleepContentCount = await SleepContent.countDocuments();
    if (sleepContentCount > 0) {
      console.log('Sleep content already seeded');
      return;
    }

    // Create sleep content
    const sleepContent = [
      {
        title: 'Rainy Night',
        description: 'Gentle rainfall sounds to help you drift off to sleep peacefully.',
        type: 'soundscape',
        audioUrl: 'https://example.com/audio/rainy-night.mp3',
        imageUrl: 'https://example.com/images/rainy-night.jpg',
        duration: 45,
        category: 'sleep',
        tags: ['rain', 'nature', 'sleep'],
        isPremium: false,
        isDownloadable: true,
      },
      {
        title: 'Ocean Waves',
        description: 'The rhythmic sound of ocean waves to lull you into a deep sleep.',
        type: 'soundscape',
        audioUrl: 'https://example.com/audio/ocean-waves.mp3',
        imageUrl: 'https://example.com/images/ocean-waves.jpg',
        duration: 60,
        category: 'sleep',
        tags: ['ocean', 'waves', 'water'],
        isPremium: false,
        isDownloadable: true,
      },
      {
        title: 'The Enchanted Forest',
        description: 'A calming bedtime story that takes you on a journey through a magical forest.',
        type: 'story',
        audioUrl: 'https://example.com/audio/enchanted-forest.mp3',
        imageUrl: 'https://example.com/images/enchanted-forest.jpg',
        duration: 30,
        category: 'sleep',
        tags: ['story', 'fantasy', 'sleep'],
        isPremium: true,
        isDownloadable: true,
      },
      {
        title: 'Evening Wind Chimes',
        description: 'Soft wind chimes creating a peaceful atmosphere for relaxation and sleep.',
        type: 'soundscape',
        audioUrl: 'https://example.com/audio/wind-chimes.mp3',
        imageUrl: 'https://example.com/images/wind-chimes.jpg',
        duration: 40,
        category: 'relaxation',
        tags: ['chimes', 'wind', 'peaceful'],
        isPremium: false,
        isDownloadable: true,
      },
      {
        title: 'Gentle Piano Lullaby',
        description: 'Soft piano melodies to help you unwind and prepare for sleep.',
        type: 'soundscape',
        audioUrl: 'https://example.com/audio/piano-lullaby.mp3',
        imageUrl: 'https://example.com/images/piano-lullaby.jpg',
        duration: 35,
        category: 'sleep',
        tags: ['piano', 'music', 'lullaby'],
        isPremium: false,
        isDownloadable: true,
      },
      {
        title: 'The Starry Night Journey',
        description: 'A guided visualization story that takes you on a peaceful journey through the night sky.',
        type: 'story',
        audioUrl: 'https://example.com/audio/starry-night.mp3',
        imageUrl: 'https://example.com/images/starry-night.jpg',
        duration: 25,
        category: 'sleep',
        tags: ['stars', 'night', 'visualization'],
        isPremium: true,
        isDownloadable: true,
      },
      {
        title: 'Twilight Forest Sounds',
        description: 'The natural ambience of a forest at dusk with gentle wildlife sounds.',
        type: 'soundscape',
        audioUrl: 'https://example.com/audio/forest-sounds.mp3',
        imageUrl: 'https://example.com/images/forest-sounds.jpg',
        duration: 50,
        category: 'relaxation',
        tags: ['forest', 'nature', 'wildlife'],
        isPremium: false,
        isDownloadable: true,
      },
      {
        title: 'Bedtime Wind Down',
        description: 'A guided relaxation session designed to prepare your body and mind for sleep.',
        type: 'story',
        audioUrl: 'https://example.com/audio/wind-down.mp3',
        imageUrl: 'https://example.com/images/wind-down.jpg',
        duration: 15,
        category: 'wind-down',
        tags: ['relaxation', 'bedtime', 'wind-down'],
        isPremium: false,
        isDownloadable: true,
      },
    ];

    const createdSleepContent = await SleepContent.insertMany(sleepContent);
    console.log(`${createdSleepContent.length} sleep content items created`);
  } catch (error) {
    console.error('Error seeding sleep content:', error);
    throw error;
  }
};

// Main seed function
export const seedMeditationData = async () => {
  try {
    const meditations = await seedMeditations();
    await seedMeditationCourses(meditations);
    await seedSleepContent();
    console.log('All meditation data seeded successfully');
  } catch (error) {
    console.error('Error seeding meditation data:', error);
  }
};