import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BackstoryState {
  type: "ayah" | "dua";
  arabic: string;
  translation: string;
  transliteration?: string;
  reference?: string;
  occasion?: string;
}

const BackstoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [backstory, setBackstory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const state = location.state as BackstoryState | null;

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    const fetchBackstory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("get-backstory", {
          body: {
            type: state.type,
            arabic: state.arabic,
            translation: state.translation,
            reference: state.reference,
            occasion: state.occasion,
          },
        });

        if (error) throw error;
        setBackstory(data.backstory);
      } catch (error) {
        console.error("Error fetching backstory:", error);
        toast.error("Couldn't load the backstory. Please try again.");
        setBackstory("We couldn't retrieve the backstory at this moment. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackstory();
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">
              {state.type === "ayah" ? "Ayah" : "Dua"} Backstory
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Original Content Card */}
        <Card className="p-6 bg-card/50 backdrop-blur border-primary/20">
          <div className="space-y-4">
            <p className="text-2xl font-arabic text-right leading-loose text-foreground">
              {state.arabic}
            </p>
            {state.transliteration && (
              <p className="text-sm text-muted-foreground italic">
                {state.transliteration}
              </p>
            )}
            <p className="text-foreground/90">{state.translation}</p>
            {state.reference && (
              <p className="text-sm text-primary font-medium">
                {state.reference}
              </p>
            )}
            {state.occasion && (
              <p className="text-sm text-muted-foreground">
                Occasion: {state.occasion}
              </p>
            )}
          </div>
        </Card>

        {/* Backstory Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/10 border-primary/10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">The Story Behind It</h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-11/12" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-10/12" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-9/12" />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {backstory.split("\n").map((paragraph, index) => (
                <p key={index} className="text-foreground/90 leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BackstoryPage;
