'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  progress: number;
  total: number;
  icon: string;
  reward?: string;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  icon: string;
  requiredAchievements: string[];
}

interface MeditationRewardsProps {
  userId: string;
  onAchievementClick: (achievement: Achievement) => void;
  onRewardClick: (reward: Reward) => void;
}

const MeditationRewards: React.FC<MeditationRewardsProps> = ({
  userId,
  onAchievementClick,
  onRewardClick
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'rewards'>('achievements');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const mockAchievements: Achievement[] = [
      {
        id: 'first-meditation',
        title: 'First Step',
        description: 'Complete your first meditation session',
        isCompleted: true,
        progress: 1,
        total: 1,
        icon: '🌱'
      },
      {
        id: 'three-day-streak',
        title: 'Consistent Mind',
        description: 'Complete 3 consecutive days of meditation',
        isCompleted: true,
        progress: 3,
        total: 3,
        icon: '🔥',
        reward: 'Ocean Waves Meditation'
      },
      {
        id: 'seven-day-streak',
        title: 'Week Warrior',
        description: 'Complete 7 consecutive days of meditation',
        isCompleted: false,
        progress: 3,
        total: 7,
        icon: '📅'
      },
      {
        id: 'morning-person',
        title: 'Early Bird',
        description: 'Complete 5 morning meditations',
        isCompleted: false,
        progress: 2,
        total: 5,
        icon: '🌅',
        reward: 'Morning Energy Boost'
      },
      {
        id: 'ten-sessions',
        title: 'Meditation Enthusiast',
        description: 'Complete 10 meditation sessions',
        isCompleted: true,
        progress: 10,
        total: 10,
        icon: '🧘',
        reward: 'Forest Soundscape'
      }
    ];

    const mockRewards: Reward[] = [
      {
        id: 'ocean-theme',
        title: 'Ocean Waves Theme',
        description: 'Unlock the calming ocean theme for your meditation sessions',
        isUnlocked: true,
        icon: '🌊',
        requiredAchievements: ['three-day-streak']
      },
      {
        id: 'forest-sounds',
        title: 'Forest Soundscape',
        description: 'Immerse yourself in the peaceful sounds of the forest',
        isUnlocked: true,
        icon: '🌳',
        requiredAchievements: ['ten-sessions']
      },
      {
        id: 'morning-boost',
        title: 'Morning Energy Boost',
        description: 'A special meditation to energize your mornings',
        isUnlocked: false,
        icon: '🌅',
        requiredAchievements: ['morning-person']
      },
      {
        id: 'cosmic-journey',
        title: 'Cosmic Journey',
        description: 'An immersive space-themed meditation experience',
        isUnlocked: false,
        icon: '🌌',
        requiredAchievements: ['seven-day-streak', 'ten-sessions']
      }
    ];

    setAchievements(mockAchievements);
    setRewards(mockRewards);
    setIsLoading(false);
  }, [userId]);

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '0.75rem', 
        padding: '1.5rem', 
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '12rem' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            border: '4px solid #4f46e5', 
            borderTopColor: 'transparent', 
            borderRadius: '9999px', 
            animation: 'spin 1s linear infinite', 
            marginBottom: '0.5rem' 
          }}></div>
          <p style={{ color: '#4b5563' }}>Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      backgroundColor: '#ffffff', 
      borderRadius: '0.75rem', 
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
      overflow: 'hidden' 
    }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        <button
          style={{ 
            flex: 1, 
            padding: '0.75rem 1rem', 
            textAlign: 'center', 
            fontWeight: '500',
            color: activeTab === 'achievements' ? '#4f46e5' : '#6b7280',
            borderBottom: activeTab === 'achievements' ? '2px solid #4f46e5' : 'none'
          }}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
        <button
          style={{ 
            flex: 1, 
            padding: '0.75rem 1rem', 
            textAlign: 'center', 
            fontWeight: '500',
            color: activeTab === 'rewards' ? '#4f46e5' : '#6b7280',
            borderBottom: activeTab === 'rewards' ? '2px solid #4f46e5' : 'none'
          }}
          onClick={() => setActiveTab('rewards')}
        >
          Rewards
        </button>
      </div>
      
      <div style={{ padding: '1rem' }}>
        {activeTab === 'achievements' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {achievements.map(achievement => (
              <motion.div
                key={achievement.id}
                style={{ 
                  padding: '0.75rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid',
                  borderColor: achievement.isCompleted ? '#a7f3d0' : '#e5e7eb',
                  backgroundColor: achievement.isCompleted ? '#ecfdf5' : '#f9fafb'
                }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onAchievementClick(achievement)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: '2.5rem', 
                    height: '2.5rem', 
                    borderRadius: '9999px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginRight: '0.75rem',
                    backgroundColor: achievement.isCompleted ? '#d1fae5' : '#f3f4f6',
                    color: achievement.isCompleted ? '#059669' : '#4b5563'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{achievement.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontWeight: '500', color: '#1f2937' }}>{achievement.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#4b5563' }}>{achievement.description}</p>
                      </div>
                      {achievement.isCompleted && (
                        <span style={{ 
                          backgroundColor: '#d1fae5', 
                          color: '#065f46', 
                          fontSize: '0.75rem', 
                          fontWeight: '500',
                          padding: '0.125rem 0.625rem',
                          borderRadius: '9999px'
                        }}>
                          Completed
                        </span>
                      )}
                    </div>
                    
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.375rem' }}>
                        <div 
                          style={{ 
                            height: '0.375rem', 
                            borderRadius: '9999px',
                            backgroundColor: achievement.isCompleted ? '#10b981' : '#3b82f6',
                            width: `${(achievement.progress / achievement.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{achievement.progress}/{achievement.total}</span>
                        {achievement.reward && (
                          <span style={{ fontSize: '0.75rem', color: '#4f46e5' }}>Reward: {achievement.reward}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {rewards.map(reward => (
              <motion.div
                key={reward.id}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '0.5rem', 
                  border: '1px solid',
                  borderColor: reward.isUnlocked ? '#c7d2fe' : '#e5e7eb',
                  backgroundColor: reward.isUnlocked ? '#eef2ff' : '#f9fafb',
                  opacity: reward.isUnlocked ? 1 : 0.7
                }}
                whileHover={reward.isUnlocked ? { scale: 1.03 } : {}}
                onClick={() => reward.isUnlocked && onRewardClick(reward)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    borderRadius: '9999px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    marginBottom: '0.5rem',
                    backgroundColor: reward.isUnlocked ? '#e0e7ff' : '#f3f4f6',
                    color: reward.isUnlocked ? '#4f46e5' : '#9ca3af'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{reward.icon}</span>
                  </div>
                  <h4 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem' }}>{reward.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: '#4b5563', marginBottom: '0.5rem' }}>{reward.description}</p>
                  {reward.isUnlocked ? (
                    <span style={{ 
                      backgroundColor: '#e0e7ff', 
                      color: '#3730a3', 
                      fontSize: '0.75rem', 
                      fontWeight: '500',
                      padding: '0.125rem 0.625rem',
                      borderRadius: '9999px'
                    }}>
                      Unlocked
                    </span>
                  ) : (
                    <span style={{ 
                      backgroundColor: '#f3f4f6', 
                      color: '#1f2937', 
                      fontSize: '0.75rem', 
                      fontWeight: '500',
                      padding: '0.125rem 0.625rem',
                      borderRadius: '9999px'
                    }}>
                      Locked
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeditationRewards;