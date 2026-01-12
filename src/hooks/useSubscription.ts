import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionState {
  isLoading: boolean;
  isPremium: boolean;
  subscriptionEnd: string | null;
  error: string | null;
}

export const useSubscription = () => {
  const [state, setState] = useState<SubscriptionState>({
    isLoading: true,
    isPremium: false,
    subscriptionEnd: null,
    error: null,
  });

  const checkSubscription = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setState({
          isLoading: false,
          isPremium: false,
          subscriptionEnd: null,
          error: null,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw error;
      }

      setState({
        isLoading: false,
        isPremium: data.subscribed || false,
        subscriptionEnd: data.subscription_end || null,
        error: null,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      }));
    }
  }, []);

  const openCheckout = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Please sign in to subscribe');
    }

    const { data, error } = await supabase.functions.invoke('create-checkout');
    
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    if (data.url) {
      // Use location.href for better compatibility with popup blockers
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Please sign in to manage subscription');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal');
    
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    
    if (data.url) {
      // Use location.href for better compatibility
      window.location.href = data.url;
    } else {
      throw new Error('No portal URL received');
    }
  }, []);

  useEffect(() => {
    checkSubscription();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    // Refresh subscription status every minute
    const interval = setInterval(checkSubscription, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSubscription]);

  return {
    ...state,
    checkSubscription,
    openCheckout,
    openCustomerPortal,
  };
};
