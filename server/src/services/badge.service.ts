// server/src/services/badge.service.ts

import User, { IUser } from '../models/user.model';
import Task from '../models/task.model';
import Post from '../models/post.model';

// Define our Badges
const BADGES = {
  // Task Badges
  FIRST_TASK: { name: "Task Taker", description: "Completed your first task." },
  TEN_TASKS: { name: "Task Master", description: "Completed 10 tasks." },
  FIRST_COLLAB: { name: "Team Player", description: "Completed a collaborative task." },

  // Wellness Badges
  STREAK_7: { name: "Week-Long Warrior", description: "Maintained a 7-day streak." },
  STREAK_30: { name: "Monthly Motivator", description: "Maintained a 30-day streak." },
  PERFECT_DAY: { name: "Perfect Day", description: "Met your calorie goal and completed at least one task." },

  // Community Badges
  FIRST_POST: { name: "Town Crier", description: "Made your first post." },
  LIKED_POST: { name: "Good Neighbor", description: "Liked 10 posts." }, // We'll track this later
};

// Master function to check and award all badges
export const checkAndAwardBadges = async (user: IUser) => {
  const newBadges = []; // To notify the user of new achievements

  // --- Badge Check: First Task ---
  if (!user.badges.includes(BADGES.FIRST_TASK.name)) {
    const completedTasks = await Task.countDocuments({ owner: user._id, isCompleted: true });
    if (completedTasks >= 1) {
      user.badges.push(BADGES.FIRST_TASK.name);
      newBadges.push(BADGES.FIRST_TASK);
    }
  }
  
  // --- Badge Check: Ten Tasks ---
  if (!user.badges.includes(BADGES.TEN_TASKS.name)) {
    const completedTasks = await Task.countDocuments({ owner: user._id, isCompleted: true });
    if (completedTasks >= 10) {
      user.badges.push(BADGES.TEN_TASKS.name);
      newBadges.push(BADGES.TEN_TASKS);
    }
  }

  // --- Badge Check: 7-Day Streak ---
  if (!user.badges.includes(BADGES.STREAK_7.name) && (user.streak || 0) >= 7) {
    user.badges.push(BADGES.STREAK_7.name);
    newBadges.push(BADGES.STREAK_7);
  }
  
  // --- Badge Check: 30-Day Streak ---
  if (!user.badges.includes(BADGES.STREAK_30.name) && (user.streak || 0) >= 30) {
    user.badges.push(BADGES.STREAK_30.name);
    newBadges.push(BADGES.STREAK_30);
  }

  // --- Badge Check: First Post ---
  if (!user.badges.includes(BADGES.FIRST_POST.name)) {
      const postCount = await Post.countDocuments({ author: user._id });
      if (postCount >= 1) {
          user.badges.push(BADGES.FIRST_POST.name);
          newBadges.push(BADGES.FIRST_POST);
      }
  }

  // Save the user if any new badges were added
  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges; // Return the list of newly earned badges
};
