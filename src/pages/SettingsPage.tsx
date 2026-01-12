import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Moon, Sun, Shield, Trash2, Loader2, FileText, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationSettings } from '@/components/NotificationSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
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
  const [deletePassword, setDeletePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
    if (!deletePassword.trim()) {
      toast({
        title: 'Password required',
        description: 'Please enter your password to confirm deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-account', {
        body: { password: deletePassword }
      });
      
      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      // Clear local storage and sign out
      localStorage.clear();
      await supabase.auth.signOut();
      
      toast({
        title: 'Account deleted',
        description: 'Your account has been permanently deleted. May Allah bless your journey.',
      });
      
      setDeleteDialogOpen(false);
      navigate('/');
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Deletion failed',
        description: error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeletePassword('');
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
    <div className="min-h-screen sabrify-gradient-bg pb-24">
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
          <div className="sabrify-card p-4">
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
          <div className="sabrify-card p-4 space-y-3">
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
            <div className="sabrify-card p-4 border border-destructive/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Delete Account</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Enter your password to permanently delete your account.
                  </p>
                  <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                      setDeletePassword('');
                      setShowPassword(false);
                    }
                  }}>
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
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Enter your password to confirm permanent deletion of your account and all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={isDeleting || !deletePassword.trim()}
                          variant="destructive"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            'Delete Account'
                          )}
                        </Button>
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
          <Link to="/terms" className="sabrify-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
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
          <div className="sabrify-card p-4 text-center space-y-2">
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
