import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Heart, Bookmark, ArrowLeft, X } from 'lucide-react';
import { duas } from '@/data/islamicContent';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const DuaFeedPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedDuas, setSavedDuas] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('savedDuas');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const [showSaved, setShowSaved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create infinite loop by tripling the duas array
  const infiniteDuas = [...duas, ...duas, ...duas];
  const middleStartIndex = duas.length;

  useEffect(() => {
    // Start from the middle section for seamless looping
    if (containerRef.current) {
      const itemHeight = containerRef.current.clientHeight;
      containerRef.current.scrollTop = middleStartIndex * itemHeight;
      setCurrentIndex(middleStartIndex);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedDuas', JSON.stringify([...savedDuas]));
  }, [savedDuas]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      
      // Reset to middle section when reaching edges for infinite loop
      if (newIndex <= duas.length * 0.5) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = (newIndex + duas.length) * itemHeight;
            setCurrentIndex(newIndex + duas.length);
          }
        }, 50);
      } else if (newIndex >= duas.length * 2.5) {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = (newIndex - duas.length) * itemHeight;
            setCurrentIndex(newIndex - duas.length);
          }
        }, 50);
      }
    }
  };

  const toggleSave = (duaId: string) => {
    setSavedDuas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(duaId)) {
        newSet.delete(duaId);
      } else {
        newSet.add(duaId);
      }
      return newSet;
    });
  };

  const savedDuasList = duas.filter(dua => savedDuas.has(dua.id));

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSaved(true)}
            className="rounded-full relative"
          >
            <Bookmark className="w-5 h-5" />
            {savedDuas.size > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {savedDuas.size}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {infiniteDuas.map((dua, index) => (
          <div
            key={`${dua.id}-${index}`}
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
            </motion.div>

            {/* Side Actions */}
            <div className="absolute right-4 bottom-1/3 flex flex-col gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleSave(dua.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  savedDuas.has(dua.id) 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/50 text-foreground'
                }`}>
                  <Heart className={`w-6 h-6 ${savedDuas.has(dua.id) ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs text-muted-foreground">Save</span>
              </motion.button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Hint */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 flex flex-col items-center gap-2 pointer-events-none">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-muted-foreground/50"
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
      </div>

      {/* Saved Duas Modal */}
      <AnimatePresence>
        {showSaved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          >
            <div className="h-full flex flex-col max-w-lg mx-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="font-heading text-lg font-medium">Saved Duas</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSaved(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Saved List */}
              <ScrollArea className="flex-1 p-4">
                {savedDuasList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Bookmark className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No saved duas yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Tap the heart icon to save duas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedDuasList.map((dua) => (
                      <motion.div
                        key={dua.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sabrify-card p-4 space-y-3"
                      >
                        <p className="text-xl font-arabic text-right leading-relaxed text-foreground">
                          {dua.arabic}
                        </p>
                        {dua.transliteration && (
                          <p className="text-xs text-muted-foreground italic">
                            {dua.transliteration}
                          </p>
                        )}
                        <p className="text-sm text-foreground/80">
                          "{dua.translation}"
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                            {dua.occasion}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSave(dua.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Heart className="w-4 h-4 fill-current mr-1" />
                            Remove
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DuaFeedPage;
