import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

interface BreathingCircleProps {
  dhikr?: string;
  isActive?: boolean;
  onComplete?: () => void;
}

export const BreathingCircle = ({ 
  dhikr = "حَسْبِيَ اللَّهُ", 
  isActive = true,
  onComplete 
}: BreathingCircleProps) => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(0);
  
  const INHALE_DURATION = 4;
  const HOLD_DURATION = 4;
  const EXHALE_DURATION = 4;
  const TOTAL_BREATHS = 3;

  useEffect(() => {
    if (!isActive) return;

    const breathCycle = () => {
      setPhase('inhale');
      setTimeout(() => {
        setPhase('hold');
        setTimeout(() => {
          setPhase('exhale');
          setTimeout(() => {
            setCount(prev => {
              const newCount = prev + 1;
              if (newCount >= TOTAL_BREATHS && onComplete) {
                onComplete();
              }
              return newCount;
            });
          }, EXHALE_DURATION * 1000);
        }, HOLD_DURATION * 1000);
      }, INHALE_DURATION * 1000);
    };

    const interval = setInterval(breathCycle, (INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION) * 1000);
    breathCycle(); // Start immediately

    return () => clearInterval(interval);
  }, [isActive, onComplete]);

  const getPhaseText = useCallback(() => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
    }
  }, [phase]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-8">
      {/* Outer glow ring */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full breathing-glow"
          animate={{
            scale: phase === 'inhale' ? [1, 1.3] : phase === 'exhale' ? [1.3, 1] : 1.3,
            opacity: phase === 'hold' ? 0.8 : [0.4, 0.7]
          }}
          transition={{
            duration: phase === 'inhale' ? INHALE_DURATION : 
                     phase === 'exhale' ? EXHALE_DURATION : 0,
            ease: 'easeInOut'
          }}
        />
        
        {/* Main circle */}
        <motion.div
          className="relative w-48 h-48 rounded-full sakina-gradient-primary flex items-center justify-center shadow-elevated"
          animate={{
            scale: phase === 'inhale' ? [1, 1.15] : phase === 'exhale' ? [1.15, 1] : 1.15,
          }}
          transition={{
            duration: phase === 'inhale' ? INHALE_DURATION : 
                     phase === 'exhale' ? EXHALE_DURATION : 0,
            ease: 'easeInOut'
          }}
        >
          {/* Dhikr text */}
          <p className="arabic-text text-2xl text-primary-foreground text-center px-4">
            {dhikr}
          </p>
        </motion.div>
      </div>

      {/* Phase indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center space-y-2"
        >
          <p className="text-xl font-heading text-foreground">{getPhaseText()}</p>
          <p className="text-sm text-muted-foreground">
            {count + 1} of {TOTAL_BREATHS} breaths
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
