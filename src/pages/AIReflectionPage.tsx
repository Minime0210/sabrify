import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, MessageCircle, Send, Loader2, AlertCircle, Sparkles, Crown, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { PremiumBanner } from '@/components/PremiumBanner';
import { getDailyAIUsage, incrementAIUsage, getLocalDateKey } from '@/lib/dailyContent';
import { AuthModal } from '@/components/AuthModal';

interface AIResponse {
  acknowledgment: string;
  ayah?: {
    arabic: string;
    translation: string;
    reference: string;
  };
  dua?: {
    arabic: string;
    translation: string;
  };
  grounding?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: AIResponse;
}

const FREE_DAILY_LIMIT = 3;
const MAX_CHAT_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_REFLECTION_LENGTH = 2000;

// Validate message structure
const isValidMessage = (obj: unknown): obj is Message => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'id' in obj &&
    'role' in obj &&
    'content' in obj &&
    typeof (obj as Message).id === 'string' &&
    ((obj as Message).role === 'user' || (obj as Message).role === 'assistant') &&
    typeof (obj as Message).content === 'string' &&
    (obj as Message).content.length <= MAX_MESSAGE_LENGTH * 2 // Allow more for AI responses
  );
};

// Validate reflection structure for AI context
interface SabrReflection {
  id: string;
  date: string;
  content: string;
}

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

const AIReflectionPage = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    isPremium, 
    isLoading: isSubLoading, 
    subscriptionEnd,
    openCheckout,
    openCustomerPortal,
    checkSubscription
  } = useSubscription();

  // Check for checkout success
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast({
        title: 'Welcome to Premium!',
        description: 'You now have unlimited AI reflections.',
      });
      checkSubscription();
    } else if (checkoutStatus === 'canceled') {
      toast({
        title: 'Checkout canceled',
        description: 'You can upgrade anytime.',
      });
    }
  }, [searchParams, checkSubscription, toast]);

  // Check auth status
  useEffect(() => {
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

  useEffect(() => {
    // Load daily count from localStorage with local timezone support
    const { count } = getDailyAIUsage();
    setDailyCount(count);

    // Chat is ephemeral for privacy - not persisted to storage
    // This protects sensitive emotional/spiritual conversations
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Chat is ephemeral - removed sessionStorage persistence for privacy

  // Require authentication to send messages (protects AI API from abuse)
  const canSendMessage = isAuthenticated && (isPremium || dailyCount < FREE_DAILY_LIMIT);
  const remainingMessages = !isAuthenticated 
    ? 'Sign in to start' 
    : isPremium 
      ? 'Unlimited' 
      : `${FREE_DAILY_LIMIT - dailyCount} remaining today`;

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    try {
      await openCheckout();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open checkout',
        variant: 'destructive',
      });
    }
  };

  const handleManage = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to open subscription management',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading || !canSendMessage) return;

    // Validate message length
    if (trimmedInput.length > MAX_MESSAGE_LENGTH) {
      toast({
        title: 'Message too long',
        description: `Please keep messages under ${MAX_MESSAGE_LENGTH} characters.`,
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedInput
    };

    // Limit stored messages to prevent memory issues
    setMessages(prev => [...prev.slice(-MAX_CHAT_MESSAGES + 1), userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get past sabr reflections for context with validation
      const storedReflections = localStorage.getItem('sabrify-sabr-reflections');
      let pastReflections: string[] = [];
      if (storedReflections) {
        try {
          const parsed = JSON.parse(storedReflections);
          if (Array.isArray(parsed)) {
            pastReflections = parsed
              .filter(isValidReflection)
              .slice(0, 3)
              .map((r: SabrReflection) => r.content);
          }
        } catch {
          // Ignore parse errors for past reflections
        }
      }

      const { data, error } = await supabase.functions.invoke('ai-reflection', {
        body: { 
          message: userMessage.content,
          pastReflections 
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.acknowledgment || '',
        response: data
      };

      // Limit stored messages to prevent memory issues
      setMessages(prev => [...prev.slice(-MAX_CHAT_MESSAGES + 1), assistantMessage]);

      // Update daily count with local timezone support
      const newCount = incrementAIUsage(dailyCount);
      setDailyCount(newCount);

    } catch (error) {
      console.error('AI reflection error:', error);
      toast({
        title: 'Unable to get response',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen sakina-gradient-bg pb-24 flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-semibold text-foreground">
                Reflection Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                {remainingMessages}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign in
              </Button>
            ) : isPremium ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 rounded-full">
                <Crown className="w-3 h-3 text-accent" />
                <span className="text-xs text-accent font-medium">Premium</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-full">
                <Sparkles className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">Free</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Premium Banner (only show when not premium and has few messages left) */}
      {!isPremium && dailyCount >= 1 && (
        <div className="px-4 mb-4 flex-shrink-0 max-w-lg mx-auto w-full">
          <PremiumBanner
            isPremium={isPremium}
            isLoading={isSubLoading}
            subscriptionEnd={subscriptionEnd}
            onUpgrade={handleUpgrade}
            onManage={handleManage}
          />
        </div>
      )}

      {/* Disclaimer */}
      <div className="px-4 mb-4 flex-shrink-0 max-w-lg mx-auto w-full space-y-2">
        <div className="bg-secondary/50 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            This assistant provides reflection and emotional support, not religious rulings or therapy.
          </p>
        </div>
        <div className="text-center text-xs text-muted-foreground/70">
          💡 Your conversation is private and will be cleared when you refresh this page
        </div>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 space-y-4 max-w-lg mx-auto w-full">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Share what's on your heart
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Express your feelings freely. You'll receive a gentle reflection with Qur'anic wisdom.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}
            >
              {msg.role === 'user' ? (
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 max-w-[85%]">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : (
                <Card className="sakina-card">
                  <CardContent className="p-4 space-y-4">
                    {/* Acknowledgment */}
                    {msg.response?.acknowledgment && (
                      <p className="text-foreground/90">
                        {msg.response.acknowledgment}
                      </p>
                    )}

                    {/* Ayah */}
                    {msg.response?.ayah && (
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                        <p className="text-right font-arabic text-xl leading-loose text-foreground">
                          {msg.response.ayah.arabic}
                        </p>
                        <p className="text-sm text-foreground/80 italic">
                          "{msg.response.ayah.translation}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          — {msg.response.ayah.reference}
                        </p>
                      </div>
                    )}

                    {/* Dua */}
                    {msg.response?.dua && (
                      <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                        <p className="text-right font-arabic text-lg text-foreground">
                          {msg.response.dua.arabic}
                        </p>
                        <p className="text-sm text-foreground/80">
                          {msg.response.dua.translation}
                        </p>
                      </div>
                    )}

                    {/* Grounding */}
                    {msg.response?.grounding && (
                      <div className="flex items-start gap-3 pt-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">🌿</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {msg.response.grounding}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="sakina-card">
              <CardContent className="p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Reflecting...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-lg mx-auto">
          {!isAuthenticated ? (
            <Card className="bg-secondary/80">
              <CardContent className="p-4 text-center space-y-3">
                <p className="text-sm text-foreground">
                  Sign in to start your reflection journey
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="sakina-gradient-primary text-primary-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In to Continue
                </Button>
                <p className="text-xs text-muted-foreground">
                  Get 3 free reflections daily
                </p>
              </CardContent>
            </Card>
          ) : !canSendMessage ? (
            <Card className="bg-secondary/80">
              <CardContent className="p-4 text-center space-y-3">
                <p className="text-sm text-foreground">
                  You've used your free messages for today
                </p>
                <Button
                  onClick={handleUpgrade}
                  className="sakina-gradient-primary text-primary-foreground"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade for Unlimited
                </Button>
                <p className="text-xs text-muted-foreground">
                  Or come back tomorrow for 3 more free messages
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How are you feeling?"
                className="min-h-12 max-h-32 resize-none bg-card border-secondary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="sakina-gradient-primary text-primary-foreground h-12 w-12 p-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={checkSubscription}
      />

      <BottomNav />
    </div>
  );
};

export default AIReflectionPage;
