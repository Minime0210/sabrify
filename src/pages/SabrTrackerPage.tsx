import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Leaf, Calendar, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday as isDateToday, parseISO } from 'date-fns';
import { getDailySabrPrompt, getLocalDateKey, isToday as isLocalToday } from '@/lib/dailyContent';
import { useToast } from '@/hooks/use-toast';

interface SabrReflection {
  id: string;
  date: string;
  content: string;
}

// Security constants for input validation
const MAX_REFLECTION_LENGTH = 2000;
const MAX_REFLECTIONS_STORED = 100;

// Validate reflection structure
const isValidReflection = (obj: unknown): obj is SabrReflection => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'date' in obj &&
    'content' in obj &&
    typeof (obj as SabrReflection).id === 'string' &&
    typeof (obj as SabrReflection).date === 'string' &&
    typeof (obj as SabrReflection).content === 'string' &&
    (obj as SabrReflection).content.length <= MAX_REFLECTION_LENGTH
  );
};

const SabrTrackerPage = () => {
  const [reflections, setReflections] = useState<SabrReflection[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [reflection, setReflection] = useState('');
  const [hasReflectedToday, setHasReflectedToday] = useState(false);
  const [pastReflection, setPastReflection] = useState<SabrReflection | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState(getDailySabrPrompt());
  const { toast } = useToast();

  useEffect(() => {
    // Set daily prompt
    setDailyPrompt(getDailySabrPrompt());
    
    // Load reflections from localStorage with validation
    const stored = localStorage.getItem('sakina-sabr-reflections');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Validate each reflection and filter invalid ones
          const validated = parsed.filter(isValidReflection).slice(0, MAX_REFLECTIONS_STORED);
          setReflections(validated);
          
          // Check if user has reflected today (using local timezone)
          const todayKey = getLocalDateKey();
          const todayReflection = validated.find(r => r.date.startsWith(todayKey));
          setHasReflectedToday(!!todayReflection);
          
          // Occasionally surface a past reflection (20% chance)
          if (validated.length > 1 && Math.random() < 0.2) {
            const oldReflections = validated.filter(r => !isDateToday(parseISO(r.date)));
            if (oldReflections.length > 0) {
              setPastReflection(oldReflections[Math.floor(Math.random() * oldReflections.length)]);
            }
          }
        }
      } catch (e) {
        console.error('Failed to parse reflections:', e);
        localStorage.removeItem('sakina-sabr-reflections');
      }
    }
  }, []);

  const saveReflection = () => {
    const trimmed = reflection.trim();
    if (!trimmed) return;

    // Validate length before saving
    if (trimmed.length > MAX_REFLECTION_LENGTH) {
      toast({
        title: 'Reflection too long',
        description: `Please keep reflections under ${MAX_REFLECTION_LENGTH} characters.`,
        variant: 'destructive',
      });
      return;
    }

    const newReflection: SabrReflection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: trimmed
    };

    // Limit storage size to prevent storage exhaustion
    const updated = [newReflection, ...reflections].slice(0, MAX_REFLECTIONS_STORED);
    setReflections(updated);
    localStorage.setItem('sakina-sabr-reflections', JSON.stringify(updated));
    
    setReflection('');
    setShowPrompt(false);
    setHasReflectedToday(true);
  };

  const skipToday = () => {
    setShowPrompt(false);
  };

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              Sabr Tracker
            </h1>
            <p className="text-sm text-muted-foreground">
              Reflect on your patience
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 space-y-6 max-w-lg mx-auto">
        {/* Past Reflection Reminder */}
        <AnimatePresence>
          {pastReflection && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="bg-secondary/30 border-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mt-1">
                        <Heart className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          You were patient through something similar before
                        </p>
                        <p className="text-sm text-foreground/90 italic">
                          "{pastReflection.content}"
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(parseISO(pastReflection.date), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPastReflection(null)}
                      className="p-1 hover:bg-secondary/50 rounded-full"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Prompt Card */}
        {!hasReflectedToday && !showPrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="sakina-card-elevated overflow-hidden">
              <div className="sakina-gradient-primary p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-primary-foreground">
                      Daily Reflection
                    </h2>
                    <p className="text-sm text-primary-foreground/80">
                      Optional • No pressure
                    </p>
                  </div>
                </div>
                <p className="text-primary-foreground/90 mb-4">
                  Would you like to reflect on a moment of patience today?
                </p>
                <Button
                  onClick={() => setShowPrompt(true)}
                  variant="secondary"
                  className="w-full bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 border-0"
                >
                  Start Reflection
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Reflection Input */}
        <AnimatePresence>
          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="sakina-card">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <p className="text-lg font-heading text-foreground mb-2">
                      "{dailyPrompt}"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Write freely. This is private and only for you.
                    </p>
                  </div>

                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="I was patient when..."
                    className="min-h-32 resize-none bg-secondary/30 border-secondary focus:border-primary/50"
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={skipToday}
                      className="flex-1"
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={saveReflection}
                      disabled={!reflection.trim()}
                      className="flex-1 sakina-gradient-primary text-primary-foreground"
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completed Today */}
        {hasReflectedToday && !showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="sakina-card bg-secondary/50">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  MashaAllah
                </h3>
                <p className="text-muted-foreground">
                  You've reflected on patience today. Take this with you.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Past Reflections */}
        {reflections.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <div className="w-1 h-4 rounded-full bg-accent" />
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Your Journey
              </h2>
            </div>

            <div className="space-y-3">
              {reflections.slice(0, 10).map((r, index) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="sakina-card">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            {format(parseISO(r.date), 'EEEE, MMMM d, yyyy')}
                          </p>
                          <p className="text-sm text-foreground/90">
                            {r.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {reflections.length === 0 && hasReflectedToday === false && !showPrompt && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Leaf className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Begin Your Sabr Journey
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Reflect on moments of patience. No pressure, no scores—just quiet recognition of your resilience.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default SabrTrackerPage;
