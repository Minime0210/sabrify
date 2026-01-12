import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Crown, LogOut, Settings, Loader2, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/AuthModal';

interface UserData {
  email: string | null;
  displayName: string | null;
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isPremium, subscriptionEnd, isLoading: subLoading, openCheckout, openCustomerPortal } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.display_name ?? null,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser({
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.display_name ?? null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpgrade = async () => {
    try {
      await openCheckout();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start checkout',
        variant: 'destructive',
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open portal',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen sakina-gradient-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <h1 className="text-xl font-heading font-medium text-foreground">Profile</h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-6">
        {/* User Info */}
        {user ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sakina-card-elevated p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-medium text-foreground truncate">
                  {user.displayName || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sakina-card-elevated p-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">Not signed in</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to unlock premium features and sync your progress
            </p>
            <Button
              onClick={() => setShowAuthModal(true)}
              className="sakina-gradient-primary text-primary-foreground"
            >
              Sign In
            </Button>
          </motion.section>
        )}

        {/* Subscription Status */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            Subscription
          </h2>
          <div className={`sakina-card p-4 ${isPremium ? 'ring-2 ring-primary/50' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isPremium ? 'bg-primary/20' : 'bg-muted'
              }`}>
                <Crown className={`w-6 h-6 ${isPremium ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">
                    {isPremium ? 'Sabrify Premium' : 'Free Plan'}
                  </h3>
                  {subLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : isPremium ? (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                {isPremium && subscriptionEnd && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
                {!isPremium && (
                  <p className="text-xs text-muted-foreground mt-1">
                    3 AI messages per day
                  </p>
                )}
              </div>
            </div>

            {user && (
              <div className="mt-4 pt-4 border-t border-border">
                {isPremium ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleManageSubscription}
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    className="w-full sakina-gradient-primary text-primary-foreground"
                    onClick={handleUpgrade}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            )}

            {!user && !isPremium && (
              <p className="text-xs text-muted-foreground text-center mt-4 pt-4 border-t border-border">
                Sign in to upgrade to Premium
              </p>
            )}
          </div>

          {/* Premium Benefits */}
          {!isPremium && (
            <div className="sakina-card p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">Premium Benefits</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Unlimited AI Reflection messages
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Priority support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Support the development
                </li>
              </ul>
            </div>
          )}
        </motion.section>

        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
            Quick Links
          </h2>
          <Link to="/settings" className="sakina-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Settings</span>
          </Link>
          <Link to="/terms" className="sakina-card p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors">
            <FileText className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">Terms & Privacy</span>
          </Link>
        </motion.section>

        {/* Sign Out */}
        {user && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </motion.section>
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
