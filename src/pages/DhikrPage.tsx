import { motion } from 'framer-motion';
import { useState } from 'react';
import { DhikrCounter } from '@/components/DhikrCounter';
import { BottomNav } from '@/components/BottomNav';
import { adhkar, Dhikr } from '@/data/islamicContent';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DhikrPage = () => {
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null);

  const handleComplete = () => {
    // Could add celebration animation or sound here
  };

  if (selectedDhikr) {
    return (
      <div className="min-h-screen sabrify-gradient-bg pb-24">
        {/* Header */}
        <header className="pt-12 pb-6 px-6 flex items-center justify-between">
          <button 
            onClick={() => setSelectedDhikr(null)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-heading font-medium text-foreground">
            Dhikr
          </h1>
          <div className="w-9" /> {/* Spacer */}
        </header>

        <main className="px-4 py-8 max-w-lg mx-auto flex flex-col items-center">
          <DhikrCounter dhikr={selectedDhikr} onComplete={handleComplete} />
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen sabrify-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-2">
          <Link to="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-heading font-medium text-foreground">
            Dhikr Sessions
          </h1>
          <div className="w-9" />
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Choose a dhikr to begin your practice
        </p>
      </header>

      <main className="px-4 max-w-lg mx-auto">
        <div className="space-y-3">
          {adhkar.map((dhikr, index) => (
            <motion.button
              key={dhikr.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => setSelectedDhikr(dhikr)}
              className="w-full sabrify-card p-4 text-left hover:shadow-card transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="arabic-text text-lg text-foreground mb-1">
                    {dhikr.arabic}
                  </p>
                  <p className="text-sm text-muted-foreground italic truncate">
                    {dhikr.transliteration}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                      {dhikr.count}x
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {dhikr.benefit}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-4" />
              </div>
            </motion.button>
          ))}
        </div>

        {/* Benefit reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 bg-secondary/50 rounded-2xl text-center"
        >
          <p className="text-sm text-foreground/80 italic">
            "The best of speech is the remembrance of Allah."
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            — Prophet Muhammad ﷺ
          </p>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default DhikrPage;
