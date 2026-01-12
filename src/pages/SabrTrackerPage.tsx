import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Leaf, Calendar, Heart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, parseISO } from 'date-fns';

interface SabrReflection {
  id: string;
  date: string;
  content: string;
}

const SabrTrackerPage = () => {
  const [reflections, setReflections] = useState<SabrReflection[]>([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [reflection, setReflection] = useState('');
  const [hasReflectedToday, setHasReflectedToday] = useState(false);
  const [pastReflection, setPastReflection] = useState<SabrReflection | null>(null);

  useEffect(() => {
    // Load reflections from localStorage
    const stored = localStorage.getItem('sakina-sabr-reflections');
    if (stored) {
      const parsed: SabrReflection[] = JSON.parse(stored);
      setReflections(parsed);
      
      // Check if user has reflected today
      const today = new Date().toISOString().split('T')[0];
      const todayReflection = parsed.find(r => r.date.startsWith(today));
      setHasReflectedToday(!!todayReflection);
      
      // Occasionally surface a past reflection (20% chance)
      if (parsed.length > 1 && Math.random() < 0.2) {
        const oldReflections = parsed.filter(r => !isToday(parseISO(r.date)));
        if (oldReflections.length > 0) {
          setPastReflection(oldReflections[Math.floor(Math.random() * oldReflections.length)]);
        }
      }
    }
  }, []);

  const saveReflection = () => {
    if (!reflection.trim()) return;

    const newReflection: SabrReflection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: reflection.trim()
    };

    const updated = [newReflection, ...reflections];
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
                      "You showed patience today by…"
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
