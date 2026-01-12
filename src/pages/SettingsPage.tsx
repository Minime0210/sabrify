import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Moon, Sun, Shield, Trash2, Loader2, FileText } from 'lucide-react';
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
      const { data, error } = await supabase.functions.invoke('request-account-deletion');
      
      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      toast({
        title: 'Confirmation email sent',
        description: 'Please check your inbox and click the link to confirm account deletion.',
      });
      
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to request account deletion. Please try again.',
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
                    We'll send a confirmation email to permanently delete your account.
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
                        <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          We will send a confirmation email to your registered email address. 
                          Click the link in that email to permanently delete your account and all associated data. 
                          The link expires in 1 hour.
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
                              Sending...
                            </>
                          ) : (
                            'Send Confirmation Email'
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

        {/* Legal */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            Legal
          </h2>
          <Link to="/terms" className="sakina-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Terms & Policies</p>
              <p className="text-xs text-muted-foreground">Privacy, Terms of Use, AI Disclaimer</p>
            </div>
          </Link>
        </section>

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
