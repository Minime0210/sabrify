import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BreathingCircle } from '@/components/BreathingCircle';
import { AyahCard } from '@/components/AyahCard';
import { DuaCard } from '@/components/DuaCard';
import { BottomNav } from '@/components/BottomNav';
import { AmbientSoundSelector } from '@/components/AmbientSoundSelector';
import { useAmbientSound, AmbientSoundType } from '@/hooks/useAmbientSound';
import { getRandomAyah, getRandomDua } from '@/data/islamicContent';
import { ArrowLeft, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

type CalmPhase = 'intro' | 'breathing' | 'reflection';

const CalmPage = () => {
  const [phase, setPhase] = useState<CalmPhase>('intro');
  const [showSoundPanel, setShowSoundPanel] = useState(false);
  const { soundType, isPlaying, volume, playSound, stopSound, updateVolume } = useAmbientSound();

  const calmingAyah = getRandomAyah('trust');
  const calmingDua = getRandomDua('calm');

  // Stop sound when leaving the page
  useEffect(() => {
    return () => {
      stopSound();
    };
  }, [stopSound]);

  const handleStartBreathing = () => {
    setPhase('breathing');
  };

  const handleBreathingComplete = () => {
    setPhase('reflection');
  };

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-center justify-between">
        <Link to="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-heading font-medium text-foreground">
          Find Your Calm
        </h1>
        <button 
          onClick={() => setShowSoundPanel(!showSoundPanel)}
          className={`p-2 -mr-2 transition-colors ${isPlaying ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Volume2 className="w-5 h-5" />
          {isPlaying && (
            <motion.span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          )}
        </button>
      </header>

      {/* Sound Panel */}
      <AnimatePresence>
        {showSoundPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4 max-w-lg mx-auto"
          >
            <div className="sakina-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Ambient Sounds</h3>
                <button 
                  onClick={() => setShowSoundPanel(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
              <AmbientSoundSelector
                currentSound={soundType}
                isPlaying={isPlaying}
                volume={volume}
                onSelectSound={playSound}
                onVolumeChange={updateVolume}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-24 h-24 mx-auto rounded-full sakina-gradient-primary opacity-80 flex items-center justify-center"
                >
                  <span className="text-4xl">🤍</span>
                </motion.div>
                
                <h2 className="text-2xl font-heading text-foreground">
                  Take a moment to breathe
                </h2>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  We'll guide you through a calming breathing exercise with dhikr to help you find peace.
                </p>
              </div>

              <div className="sakina-card p-6">
                <p className="arabic-text text-xl text-foreground mb-3">
                  حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ
                </p>
                <p className="text-sm text-muted-foreground italic">
                  Ḥasbiya Allāhu lā ilāha illā huwa
                </p>
                <p className="text-foreground/80 mt-2 text-sm">
                  "Sufficient for me is Allah; there is no deity except Him."
                </p>
              </div>

              <motion.button
                onClick={handleStartBreathing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-2xl sakina-gradient-primary text-primary-foreground font-medium shadow-elevated"
              >
                Begin Breathing Exercise
              </motion.button>
            </motion.div>
          )}

          {/* Breathing Phase */}
          {phase === 'breathing' && (
            <motion.div
              key="breathing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center"
            >
              <BreathingCircle 
                dhikr="حَسْبِيَ اللَّهُ"
                isActive={true}
                onComplete={handleBreathingComplete}
              />
              
              <motion.button
                onClick={handleBreathingComplete}
                className="mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip to reflection →
              </motion.button>
            </motion.div>
          )}

          {/* Reflection Phase */}
          {phase === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-8 space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h2 className="text-xl font-heading text-foreground">
                  Well done
                </h2>
                <p className="text-muted-foreground text-sm">
                  May Allah grant you continued peace and tranquility
                </p>
              </div>

              <AyahCard ayah={calmingAyah} />
              
              <DuaCard dua={calmingDua} />

              <div className="flex gap-4 pt-4">
                <motion.button
                  onClick={() => setPhase('breathing')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
                >
                  Breathe Again
                </motion.button>
                <Link to="/" className="flex-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl sakina-gradient-primary text-primary-foreground font-medium"
                  >
                    Return Home
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
};

export default CalmPage;
