import { motion } from 'framer-motion';
import { BottomNav } from '@/components/BottomNav';
import { ArrowLeft, Shield, FileText, Bot, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const TermsPage = () => {
  return (
    <div className="min-h-screen sabrify-gradient-bg pb-24">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 flex items-center">
        <Link to="/settings" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-heading font-medium text-foreground ml-2">
          Terms & Policies
        </h1>
      </header>

      <main className="px-4 max-w-lg mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sabrify-card p-4"
        >
          <Accordion type="single" collapsible className="w-full">
            {/* Privacy Policy */}
            <AccordionItem value="privacy">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Privacy Policy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-muted-foreground pt-2">
                  <p className="text-foreground font-medium">Your privacy matters to us.</p>
                  <p>
                    This app is designed to be privacy-first. We do not sell your data, display ads, 
                    or track you for marketing purposes.
                  </p>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">What We Collect</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Basic app usage data (for performance and stability)</li>
                      <li>Optional text you choose to enter (e.g. reflections or AI messages)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">What We Do NOT Do</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>We do not sell or share your personal data</li>
                      <li>We do not display third-party ads</li>
                      <li>We do not use your private reflections to identify you</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">AI & Data</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Messages sent to the AI are processed only to provide responses</li>
                      <li>We do not train AI models on your personal data</li>
                      <li>You may delete your data at any time</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Storage</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Most reflections are stored locally on your device</li>
                      <li>Some AI features may require secure cloud processing</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Contact</p>
                    <p>If you have privacy concerns, contact us at: support@sabrify.app</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Terms of Use */}
            <AccordionItem value="terms">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-accent" />
                  </div>
                  <span className="font-medium text-foreground">Terms of Use</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-muted-foreground pt-2">
                  <p>By using this app, you agree to the following terms:</p>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">Purpose of the App</p>
                    <p>
                      This app provides spiritual reminders, reflection tools, and emotional support 
                      grounded in Islamic values. It is intended for general well-being only.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Not Medical or Religious Authority</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>This app does not provide medical, psychological, or religious rulings</li>
                      <li>Content is not a replacement for licensed therapists</li>
                      <li>Content is not a replacement for qualified scholars</li>
                      <li>Content is not a replacement for medical professionals</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">User Responsibility</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>You use the app voluntarily</li>
                      <li>You are responsible for how you apply the content in your life</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Availability</p>
                    <p>
                      We may update, modify, or discontinue features at any time to improve the app.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* AI Disclaimer */}
            <AccordionItem value="ai">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="font-medium text-foreground">AI Disclaimer</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-muted-foreground pt-2">
                  <p>
                    The AI feature in this app is designed to provide gentle reflection and emotional support.
                  </p>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">What the AI Is</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>A reflection assistant</li>
                      <li>A supportive companion for calm and grounding</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">What the AI Is NOT</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>A therapist</li>
                      <li>A religious scholar</li>
                      <li>A source of fatwas or rulings</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-foreground mb-2">Important Notes</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>AI responses are generated automatically and may not always be perfect</li>
                      <li>The AI does not speak on behalf of Allah</li>
                      <li>The AI does not provide professional advice</li>
                    </ul>
                  </div>

                  <p className="text-foreground font-medium">
                    If you need medical, psychological, or religious guidance, please consult a qualified professional.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Crisis Disclaimer */}
            <AccordionItem value="crisis">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="font-medium text-foreground">Crisis Support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-muted-foreground pt-2">
                  <p className="text-foreground font-medium">
                    This app is not designed for emergencies.
                  </p>
                  
                  <div>
                    <p className="font-medium text-foreground mb-2">If you are experiencing:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Severe emotional distress</li>
                      <li>Thoughts of self-harm</li>
                      <li>Feelings of hopelessness or despair</li>
                    </ul>
                  </div>

                  <p className="text-foreground font-medium">Please seek immediate help.</p>

                  <div>
                    <p className="font-medium text-foreground mb-2">Emergency Resources</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Contact your local emergency number</li>
                      <li>Reach out to a trusted person</li>
                      <li>Use a local mental health crisis hotline</li>
                    </ul>
                  </div>

                  <p className="text-primary font-medium pt-2 border-t border-border">
                    You deserve help, care, and support beyond this app. 💚
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
};

export default TermsPage;