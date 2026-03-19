import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setStatus("loading");
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: trimmed, is_active: true }, { onConflict: "email" });
    if (error) {
      toast({ title: "Something went wrong", description: error.message, variant: "destructive" });
      setStatus("idle");
      return;
    }
    setStatus("success");
    setEmail("");
    toast({ title: "You're subscribed! 🎉", description: "We'll keep you in the loop." });
  };

  return (
    <section className="py-16 sm:py-20 border-t border-border/30">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-md mx-auto text-center">
          <h3 className="font-display text-xl sm:text-2xl font-bold mb-3">
            Stay in the loop
          </h3>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
            New ticket drops and platform updates. No spam.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-primary animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium text-sm">You're on the list!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-base sm:text-sm"
                disabled={status === "loading"}
              />
              <Button variant="hero" type="submit" disabled={status === "loading"} className="px-8 py-4 h-auto rounded-xl min-h-[52px]">
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground/60 mt-4">
            Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
