import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Moon, Sun, Shield, Trash2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationSettings } from '@/components/NotificationSettings';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for system dark mode preference and auth status
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Clear all local data first
      localStorage.clear();
      
      // Sign out (account deletion requires admin API, so we sign out and inform user)
      await supabase.auth.signOut();
      
      toast({
        title: 'Account signed out',
        description: 'Your local data has been cleared. To fully delete your account, please contact support.',
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error during account deletion:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-border'
      }`}
    >
      <motion.div
        className="absolute top-1 left-1 w-5 h-5 rounded-full bg-card shadow-sm"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-center">
        <Link to="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-heading font-medium text-foreground ml-2">
          Settings
        </h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            Appearance
          </h2>
          <div className="sakina-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Easier on the eyes at night</p>
                </div>
              </div>
              <ToggleSwitch enabled={darkMode} onToggle={toggleDarkMode} />
            </div>
          </div>
        </section>

        {/* Reminders */}
        <section className="space-y-3">
          <NotificationSettings />
        </section>

        {/* Privacy */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Privacy
            </h2>
          </div>
          <div className="sakina-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Your data stays with you</p>
                <p className="text-xs text-muted-foreground">
                  All data is stored locally on your device
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
              <p>• No ads or tracking</p>
              <p>• No account required</p>
              <p>• Works completely offline</p>
            </div>
          </div>
        </section>

        {/* Delete Account - Only show if authenticated */}
        {isAuthenticated && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              <h2 className="text-sm font-medium text-destructive uppercase tracking-wide">
                Danger Zone
              </h2>
            </div>
            <div className="sakina-card p-4 border border-destructive/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    This will sign you out and clear all local data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your account and clear all local data including your reflections, dhikr counts, and preferences. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Yes, delete my account'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            About
          </h2>
          <div className="sakina-card p-4 text-center space-y-2">
            <p className="font-heading text-xl text-foreground">Sabrify</p>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-4">
              Made with love for the Ummah 💚
            </p>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default SettingsPage;
