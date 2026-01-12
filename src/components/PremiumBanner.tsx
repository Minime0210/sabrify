import { motion } from 'framer-motion';
import { Sparkles, Crown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PremiumBannerProps {
  isPremium: boolean;
  isLoading: boolean;
  subscriptionEnd: string | null;
  onUpgrade: () => void;
  onManage: () => void;
}

export const PremiumBanner = ({
  isPremium,
  isLoading,
  subscriptionEnd,
  onUpgrade,
  onManage,
}: PremiumBannerProps) => {
  if (isLoading) {
    return (
      <Card className="bg-secondary/30">
        <CardContent className="p-4 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Checking subscription...</span>
        </CardContent>
      </Card>
    );
  }

  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-accent/20 to-primary/10 border-accent/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Premium Active</span>
                    <span className="px-2 py-0.5 text-xs bg-accent/20 text-accent rounded-full">
                      Unlimited
                    </span>
                  </div>
                  {subscriptionEnd && (
                    <p className="text-xs text-muted-foreground">
                      Renews {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onManage}
                className="text-muted-foreground hover:text-foreground"
              >
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-medium text-foreground mb-1">
                Unlock Unlimited Reflections
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 mb-3">
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Unlimited AI messages per day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Deeper spiritual insights
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3 h-3 text-primary" />
                  Support the app's mission
                </li>
              </ul>
              <Button
                onClick={onUpgrade}
                className="sabrify-gradient-primary text-primary-foreground w-full sm:w-auto"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade for $4.99/month
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
