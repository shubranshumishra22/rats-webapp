'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MeditationGameProps {
  duration: number;
  theme: 'forest' | 'ocean' | 'space' | 'mountain';
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

const MeditationGame: React.FC<MeditationGameProps> = ({ 
  duration, 
  theme, 
  onComplete 
}) => {
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  // Theme-specific settings
  const themeSettings = {
    forest: {
      bgColor: 'from-green-500 to-emerald-700',
      particleColors: ['#a7f3d0', '#6ee7b7', '#34d399', '#10b981'],
      breathText: 'Feel the forest air filling your lungs',
      icon: '🌳',
      soundEffect: '/sounds/forest.mp3'
    },
    ocean: {
      bgColor: 'from-blue-500 to-cyan-700',
      particleColors: ['#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9'],
      breathText: 'Flow with the gentle ocean waves',
      icon: '🌊',
      soundEffect: '/sounds/ocean.mp3'
    },
    space: {
      bgColor: 'from-indigo-800 to-purple-900',
      particleColors: ['#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
      breathText: 'Expand like the infinite universe',
      icon: '✨',
      soundEffect: '/sounds/space.mp3'
    },
    mountain: {
      bgColor: 'from-stone-700 to-stone-900',
      particleColors: ['#e7e5e4', '#d6d3d1', '#a8a29e', '#78716c'],
      breathText: 'Strong and steady like a mountain',
      icon: '⛰️',
      soundEffect: '/sounds/mountain.mp3'
    }
  };

  // Initialize the game
  useEffect(() => {
    // Start with a 3-second countdown
    let countDown = 3;
    const countInterval = setInterval(() => {
      countDown -= 1;
      if (countDown <= 0) {
        clearInterval(countInterval);
        setIsActive(true);
      }
    }, 1000);

    // Initialize particles
    const initialParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      initialParticles.push(createParticle(i));
    }
    setParticles(initialParticles);

    return () => {
      clearInterval(countInterval);
      cancelAnimationFrame(animationRef.current);
    };
  }, [theme]);

  // Breathing cycle
  useEffect(() => {
    if (!isActive) return;

    const breathCycle = () => {
      // Inhale for 4 seconds
      setBreathPhase('inhale');
      setTimeout(() => {
        // Hold for 4 seconds
        setBreathPhase('hold');
        setTimeout(() => {
          // Exhale for 6 seconds
          setBreathPhase('exhale');
          setTimeout(() => {
            // Rest for 2 seconds
            setBreathPhase('rest');
            setTimeout(() => {
              // Increment score and streak
              setScore(prev => prev + 10);
              setStreakCount(prev => prev + 1);
              
              // Continue the cycle
              if (isActive) {
                breathCycle();
              }
            }, 2000);
          }, 6000);
        }, 4000);
      }, 4000);
    };

    breathCycle();

    return () => {
      // Cleanup
    };
  }, [isActive]);

  // Timer countdown
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
      
      setProgress(prev => {
        const newProgress = prev + (100 / (duration * 60));
        return Math.min(newProgress, 100);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, duration]);

  // Particle animation
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      setParticles(prevParticles => {
        return prevParticles.map(particle => {
          // Move particle
          const newY = particle.y - particle.speed;
          
          // Reset if it goes off screen
          if (newY < -particle.size) {
            return createParticle(particle.id, canvas.width, canvas.height);
          }
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, newY, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `${particle.color}${Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
          
          return {
            ...particle,
            y: newY,
            opacity: breathPhase === 'inhale' ? Math.min(particle.opacity + 0.01, 0.8) : 
                     breathPhase === 'exhale' ? Math.max(particle.opacity - 0.01, 0.2) : 
                     particle.opacity
          };
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isActive, breathPhase]);

  const createParticle = (id: number, width = 0, height = 0): Particle => {
    const canvas = canvasRef.current;
    const w = width || (canvas?.offsetWidth || 300);
    const h = height || (canvas?.offsetHeight || 400);
    
    const colors = themeSettings[theme].particleColors;
    
    return {
      id,
      x: Math.random() * w,
      y: h + Math.random() * 20,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.5 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
  };

  const handleComplete = () => {
    setIsActive(false);
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstructions = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe in...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe out...';
      case 'rest': return 'Rest...';
      default: return 'Prepare...';
    }
  };

  // Get background gradient based on theme
  const getBackgroundGradient = () => {
    switch(theme) {
      case 'forest':
        return 'linear-gradient(to bottom, #10b981, #065f46)';
      case 'ocean':
        return 'linear-gradient(to bottom, #0ea5e9, #0c4a6e)';
      case 'space':
        return 'linear-gradient(to bottom, #4f46e5, #581c87)';
      case 'mountain':
        return 'linear-gradient(to bottom, #57534e, #292524)';
      default:
        return 'linear-gradient(to bottom, #10b981, #065f46)';
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      borderRadius: '0.75rem', 
      height: '500px', 
      background: getBackgroundGradient() 
    }}>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%'
        }}
      />
      
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        color: '#ffffff', 
        padding: '1.5rem' 
      }}>
        {!isActive && !showSuccess ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Prepare for your {theme} meditation</h3>
            <p style={{ marginBottom: '1.5rem' }}>Find a comfortable position and get ready to focus on your breath</p>
            <div style={{ 
              fontSize: '3.75rem', 
              marginBottom: '1.5rem', 
              animation: 'float 3s ease-in-out infinite' 
            }}>{themeSettings[theme].icon}</div>
            <p style={{ fontSize: '1.125rem' }}>Starting in a moment...</p>
          </div>
        ) : showSuccess ? (
          <motion.div 
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Great job!</h3>
            <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🎉</div>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>You completed your meditation session</p>
            <p style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>{score} points</p>
            <p style={{ fontSize: '0.875rem' }}>Breath streak: {streakCount}</p>
          </motion.div>
        ) : (
          <>
            <div style={{ 
              position: 'absolute', 
              top: '1rem', 
              right: '1rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '9999px', 
              paddingLeft: '0.75rem', 
              paddingRight: '0.75rem', 
              paddingTop: '0.25rem', 
              paddingBottom: '0.25rem', 
              fontSize: '0.875rem' 
            }}>
              {formatTime(secondsLeft)}
            </div>
            
            <div style={{ 
              position: 'absolute', 
              top: '1rem', 
              left: '1rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '9999px', 
              paddingLeft: '0.75rem', 
              paddingRight: '0.75rem', 
              paddingTop: '0.25rem', 
              paddingBottom: '0.25rem', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <span style={{ marginRight: '0.25rem' }}>Score:</span>
              <span style={{ fontWeight: 'bold' }}>{score}</span>
            </div>
            
            <motion.div 
              style={{ 
                width: '10rem', 
                height: '10rem', 
                borderRadius: '9999px', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '2rem' 
              }}
              animate={{
                scale: breathPhase === 'inhale' ? 1.3 : 
                       breathPhase === 'exhale' ? 0.8 : 1
              }}
              transition={{ duration: breathPhase === 'exhale' ? 6 : 4, ease: "easeInOut" }}
            >
              <div style={{ fontSize: '3.75rem' }}>{themeSettings[theme].icon}</div>
            </motion.div>
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{getBreathInstructions()}</h3>
            <p style={{ textAlign: 'center', maxWidth: '28rem', marginBottom: '2rem' }}>{themeSettings[theme].breathText}</p>
            
            <div style={{ 
              width: '100%', 
              maxWidth: '28rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              borderRadius: '9999px', 
              height: '0.625rem', 
              marginBottom: '1rem' 
            }}>
              <div 
                style={{ 
                  backgroundColor: '#ffffff', 
                  height: '0.625rem', 
                  borderRadius: '9999px',
                  width: `${progress}%` 
                }}
              ></div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                paddingLeft: '0.75rem', 
                paddingRight: '0.75rem', 
                paddingTop: '0.25rem', 
                paddingBottom: '0.25rem', 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderRadius: '9999px', 
                fontSize: '0.875rem' 
              }}>
                Streak: {streakCount}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MeditationGame;