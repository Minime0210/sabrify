import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { Dhikr } from '@/data/islamicContent';
import { Check, RotateCcw } from 'lucide-react';

interface DhikrCounterProps {
  dhikr: Dhikr;
  onComplete?: () => void;
}

export const DhikrCounter = ({ dhikr, onComplete }: DhikrCounterProps) => {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleTap = useCallback(() => {
    if (isComplete) return;
    
    const newCount = count + 1;
    setCount(newCount);
    
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (newCount >= dhikr.count) {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  }, [count, dhikr.count, isComplete, onComplete]);

  const handleReset = () => {
    setCount(0);
    setIsComplete(false);
  };

  const progress = (count / dhikr.count) * 100;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Main counter button */}
      <motion.button
        onClick={handleTap}
        whileTap={{ scale: 0.95 }}
        className="relative w-56 h-56 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="112"
            cy="112"
            r="104"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="112"
            cy="112"
            r="104"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              strokeDasharray: '653.45',
              strokeDashoffset: 0
            }}
          />
        </svg>

        {/* Inner content */}
        <div className="absolute inset-4 rounded-full bg-card shadow-card flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-full sabrify-gradient-primary flex items-center justify-center">
                  <Check className="w-6 h-6 text-primary-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Complete</p>
              </motion.div>
            ) : (
              <motion.div
                key="counting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                <span className="text-4xl font-heading font-semibold text-foreground">
                  {count}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {dhikr.count}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      {/* Dhikr text */}
      <div className="text-center space-y-3">
        <p className="arabic-text text-2xl text-foreground">
          {dhikr.arabic}
        </p>
        <p className="text-muted-foreground italic">
          {dhikr.transliteration}
        </p>
        <p className="text-sm text-foreground/80">
          {dhikr.translation}
        </p>
      </div>

      {/* Reset button */}
      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="text-sm">Reset</span>
      </button>
    </div>
  );
};
