import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Dua } from '@/data/islamicContent';
import { Button } from '@/components/ui/button';

interface DuaCardProps {
  dua: Dua;
  compact?: boolean;
  showBackstoryButton?: boolean;
}

export const DuaCard = ({ dua, compact = false, showBackstoryButton = true }: DuaCardProps) => {
  const navigate = useNavigate();

  const handleLearnBackstory = () => {
    navigate('/backstory', {
      state: {
        type: 'dua',
        arabic: dua.arabic,
        translation: dua.translation,
        transliteration: dua.transliteration,
        occasion: dua.occasion,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`sabrify-card ${compact ? 'p-4' : 'p-6'}`}
    >
      <div className="space-y-4">
        {/* Occasion Badge */}
        <div className="flex justify-center">
          <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full">
            {dua.occasion}
          </span>
        </div>

        {/* Arabic */}
        <p className={`arabic-text text-center text-foreground ${compact ? 'text-lg' : 'text-xl md:text-2xl'}`}>
          {dua.arabic}
        </p>

        {/* Transliteration */}
        {dua.transliteration && (
          <p className="text-center text-muted-foreground italic text-sm">
            {dua.transliteration}
          </p>
        )}

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-12 h-px bg-border" />
        </div>

        {/* Translation */}
        <p className={`text-center text-foreground/80 ${compact ? 'text-sm' : 'text-base'}`}>
          {dua.translation}
        </p>

        {/* Backstory Button */}
        {showBackstoryButton && !compact && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLearnBackstory}
              className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Learn the backstory
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
