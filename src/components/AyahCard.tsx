import { motion } from 'framer-motion';
import { Ayah } from '@/data/islamicContent';

interface AyahCardProps {
  ayah: Ayah;
  showTransliteration?: boolean;
}

export const AyahCard = ({ ayah, showTransliteration = true }: AyahCardProps) => {
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
      </div>
    </motion.div>
  );
};
