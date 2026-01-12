import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, MessageCircle, Send, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const AIReflectionPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [isPremium] = useState(false); // TODO: Implement premium check
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load daily count from localStorage
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('sakina-ai-usage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        setDailyCount(parsed.count);
      } else {
        localStorage.setItem('sakina-ai-usage', JSON.stringify({ date: today, count: 0 }));
      }
    }

    // Load chat history from session
    const history = sessionStorage.getItem('sakina-ai-chat');
    if (history) {
      setMessages(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Save chat to session
    if (messages.length > 0) {
      sessionStorage.setItem('sakina-ai-chat', JSON.stringify(messages));
    }
  }, [messages]);

  const canSendMessage = isPremium || dailyCount < FREE_DAILY_LIMIT;
  const remainingMessages = isPremium ? 'Unlimited' : `${FREE_DAILY_LIMIT - dailyCount} remaining today`;

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !canSendMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get past sabr reflections for context (with user consent implied by using the feature)
      const storedReflections = localStorage.getItem('sakina-sabr-reflections');
      let pastReflections: string[] = [];
      if (storedReflections) {
        const parsed = JSON.parse(storedReflections);
        pastReflections = parsed.slice(0, 3).map((r: any) => r.content);
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

      setMessages(prev => [...prev, assistantMessage]);

      // Update daily count
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('sakina-ai-usage', JSON.stringify({ date: today, count: newCount }));

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
          {!isPremium && (
            <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 rounded-full">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-xs text-accent font-medium">Free</span>
            </div>
          )}
        </div>
      </header>

      {/* Disclaimer */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="bg-secondary/50 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            This assistant provides reflection and emotional support, not religious rulings or therapy.
          </p>
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
          {!canSendMessage ? (
            <Card className="bg-secondary/80">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-foreground mb-2">
                  You've used your free messages for today
                </p>
                <p className="text-xs text-muted-foreground">
                  Come back tomorrow, or upgrade for unlimited reflections
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

      <BottomNav />
    </div>
  );
};

export default AIReflectionPage;
