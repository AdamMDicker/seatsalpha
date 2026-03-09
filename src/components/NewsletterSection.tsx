import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
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
    <section className="py-16 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Stay Updated</span>
          </div>

          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Never Miss a <span className="text-primary">Drop</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Get notified about new ticket releases, exclusive deals, and platform updates. No spam, ever.
          </p>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-primary animate-fade-in">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">You're on the list!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-card/80 backdrop-blur border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                disabled={status === "loading"}
              />
              <Button variant="hero" type="submit" disabled={status === "loading"} className="px-6 py-3 h-auto">
                {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
