import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Share2, Heart, BookOpen, ArrowLeft } from 'lucide-react';
import { duas } from '@/data/islamicContent';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DuaFeedPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedDuas, setLikedDuas] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < duas.length) {
      setCurrentIndex(newIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (containerRef.current && index >= 0 && index < duas.length) {
      containerRef.current.scrollTo({
        top: index * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const toggleLike = (duaId: string) => {
    setLikedDuas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(duaId)) {
        newSet.delete(duaId);
      } else {
        newSet.add(duaId);
      }
      return newSet;
    });
  };

  const handleShare = async (dua: typeof duas[0]) => {
    const shareText = `${dua.arabic}\n\n"${dua.translation}"\n\n— ${dua.occasion}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dua from Sabrify',
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleBackstory = (dua: typeof duas[0]) => {
    navigate('/backstory', { 
      state: { 
        type: 'dua',
        arabic: dua.arabic,
        translation: dua.translation,
        reference: dua.occasion
      } 
    });
  };

  // Gradient backgrounds for variety
  const gradients = [
    'from-primary/20 via-background to-secondary/20',
    'from-accent/20 via-background to-primary/10',
    'from-secondary/30 via-background to-accent/20',
    'from-primary/10 via-accent/10 to-secondary/20',
    'from-accent/30 via-background to-primary/20',
  ];

  return (
    <div className="fixed inset-0 bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-background via-background/80 to-transparent">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-heading text-lg font-medium">Daily Duas</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {duas.map((dua, index) => (
          <div
            key={dua.id}
            className={`h-full w-full snap-start snap-always flex items-center justify-center p-6 bg-gradient-to-br ${gradients[index % gradients.length]}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: currentIndex === index ? 1 : 0.5, scale: currentIndex === index ? 1 : 0.95 }}
              transition={{ duration: 0.3 }}
              className="max-w-md w-full text-center space-y-8"
            >
              {/* Arabic Text */}
              <div className="space-y-2">
                <p className="text-3xl md:text-4xl font-arabic leading-loose text-foreground">
                  {dua.arabic}
                </p>
              </div>

              {/* Transliteration */}
              {dua.transliteration && (
                <p className="text-sm text-muted-foreground italic">
                  {dua.transliteration}
                </p>
              )}

              {/* Translation */}
              <p className="text-lg md:text-xl text-foreground/90 font-heading leading-relaxed">
                "{dua.translation}"
              </p>

              {/* Occasion Badge */}
              <div className="flex justify-center">
                <span className="px-4 py-2 rounded-full bg-secondary/50 text-sm text-muted-foreground">
                  {dua.occasion}
                </span>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center gap-1.5 pt-4">
                {duas.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex 
                        ? 'w-6 bg-primary' 
                        : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Side Actions */}
            <div className="absolute right-4 bottom-1/3 flex flex-col gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleLike(dua.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  likedDuas.has(dua.id) 
                    ? 'bg-red-500/20 text-red-500' 
                    : 'bg-secondary/50 text-foreground'
                }`}>
                  <Heart className={`w-6 h-6 ${likedDuas.has(dua.id) ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs text-muted-foreground">Save</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleBackstory(dua)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Story</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleShare(dua)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">Share</span>
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Hints */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-2 pointer-events-none">
        {currentIndex < duas.length - 1 && (
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-muted-foreground/50"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        )}
      </div>

      {currentIndex > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 top-20 flex flex-col items-center pointer-events-none">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-muted-foreground/50"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DuaFeedPage;
