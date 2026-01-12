import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AyahCard } from '@/components/AyahCard';
import { MoodSelector } from '@/components/MoodSelector';
import { DuaCard } from '@/components/DuaCard';
import { BottomNav } from '@/components/BottomNav';
import { moodResponses, MoodType, Ayah, Dua } from '@/data/islamicContent';
import { getDailyAyah, getMoodContent } from '@/lib/dailyContent';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [moodContent, setMoodContent] = useState<{ message: string; ayah: Ayah; dua: Dua } | null>(null);

  useEffect(() => {
    setDailyAyah(getDailyAyah());
  }, []);

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood);
    const response = moodResponses[mood];
    // Use deterministic mood content with avoidance of recent items
    const { ayah, dua } = getMoodContent(mood, response.ayat, response.duas);
    setMoodContent({
      message: response.message,
      ayah,
      dua
    });
  };

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-heading font-semibold text-foreground mb-1">
            Sabrify
          </h1>
          <p className="text-muted-foreground text-sm">
            Tranquility for your soul
          </p>
        </motion.div>
      </header>

      <main className="px-4 space-y-8 max-w-lg mx-auto">
        {/* Stress Mode Quick Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Link to="/calm">
            <div className="sakina-card-elevated sakina-gradient-primary text-primary-foreground p-6 cursor-pointer hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">I feel overwhelmed</p>
                    <p className="text-sm opacity-80">Tap for instant calm</p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 opacity-60" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Daily Ayah */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1 h-4 rounded-full sakina-gradient-primary" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Today's Reflection
            </h2>
          </div>
          
          {dailyAyah && <AyahCard ayah={dailyAyah} />}
        </section>

        {/* Mood Check-in */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1 h-4 rounded-full bg-accent" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Check In
            </h2>
          </div>
          
          <div className="sakina-card">
            <MoodSelector onSelect={handleMoodSelect} selectedMood={selectedMood} />
          </div>
        </section>

        {/* Personalized Content based on mood */}
        {moodContent && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                For You
              </h2>
            </div>

            {/* Message */}
            <div className="sakina-card bg-secondary/50">
              <p className="text-center font-heading text-foreground/90 italic">
                {moodContent.message}
              </p>
            </div>

            {/* Recommended Ayah */}
            <AyahCard ayah={moodContent.ayah} />

            {/* Recommended Dua */}
            <DuaCard dua={moodContent.dua} />
          </motion.section>
        )}

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4 pb-4">
          <Link to="/dhikr">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="sakina-card p-5 text-center cursor-pointer hover:shadow-card transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">📿</span>
              </div>
              <p className="font-medium text-foreground">Dhikr</p>
              <p className="text-xs text-muted-foreground mt-1">Count & reflect</p>
            </motion.div>
          </Link>

          <Link to="/calm">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="sakina-card p-5 text-center cursor-pointer hover:shadow-card transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">🌙</span>
              </div>
              <p className="font-medium text-foreground">Breathe</p>
              <p className="text-xs text-muted-foreground mt-1">Guided calm</p>
            </motion.div>
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
