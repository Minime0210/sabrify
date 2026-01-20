import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Ayah } from '@/data/islamicContent';
import { Button } from '@/components/ui/button';

interface AyahCardProps {
  ayah: Ayah;
  showTransliteration?: boolean;
  showBackstoryButton?: boolean;
}

export const AyahCard = ({ ayah, showTransliteration = true, showBackstoryButton = true }: AyahCardProps) => {
  const navigate = useNavigate();

  const handleLearnBackstory = () => {
    navigate('/backstory', {
      state: {
        type: 'ayah',
        arabic: ayah.arabic,
        translation: ayah.translation,
        transliteration: ayah.transliteration,
        reference: ayah.reference,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="sabrify-card-elevated"
    >
      <div className="space-y-6">
        {/* Arabic Text */}
        <div className="text-center">
          <p className="arabic-text text-2xl md:text-3xl text-foreground leading-loose">
            {ayah.arabic}
          </p>
        </div>

        {/* Transliteration */}
        {showTransliteration && ayah.transliteration && (
          <p className="text-center text-muted-foreground italic text-sm md:text-base">
            {ayah.transliteration}
          </p>
        )}

        {/* Divider */}
        <div className="flex justify-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
        </div>

        {/* Translation */}
        <p className="text-center font-heading text-foreground/90 text-lg md:text-xl leading-relaxed">
          "{ayah.translation}"
        </p>

        {/* Reference */}
        <p className="text-center text-sm text-muted-foreground">
          — {ayah.reference}
        </p>

        {/* Backstory Button */}
        {showBackstoryButton && (
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
