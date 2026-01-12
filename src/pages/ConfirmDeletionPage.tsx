import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const ConfirmDeletionPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmDeletion = async () => {
      const token = searchParams.get('token');
      const userId = searchParams.get('userId');

      if (!token || !userId) {
        setStatus('error');
        setMessage('Invalid deletion link. Please request a new one.');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('confirm-account-deletion', {
          body: { token, userId }
        });

        if (error) {
          throw error;
        }

        if (data.error) {
          throw new Error(data.error);
        }

        // Clear local storage
        localStorage.clear();

        setStatus('success');
        setMessage(data.message || 'Your account has been permanently deleted.');
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to delete account. Please try again.');
      }
    };

    confirmDeletion();
  }, [searchParams]);

  return (
    <div className="min-h-screen sabrify-gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sabrify-card-elevated max-w-md w-full p-8 text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h1 className="text-xl font-heading font-medium text-foreground mb-2">
              Processing...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we delete your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-xl font-heading font-medium text-foreground mb-2">
              Account Deleted
            </h1>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              May Allah bless you on your journey. You are always welcome back. 💚
            </p>
            <Link to="/">
              <Button className="sabrify-gradient-primary text-primary-foreground">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-heading font-medium text-foreground mb-2">
              Deletion Failed
            </h1>
            <p className="text-muted-foreground mb-6">
              {message}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/settings">
                <Button variant="outline">
                  Go to Settings
                </Button>
              </Link>
              <Link to="/">
                <Button className="sabrify-gradient-primary text-primary-foreground">
                  <Home className="w-4 h-4 mr-2" />
                  Return Home
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ConfirmDeletionPage;