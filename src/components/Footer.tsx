import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logoImage from "@/assets/seats-logo-new-v7.png";

const Footer = () => {
  const [footerEmail, setFooterEmail] = useState("");
  const [footerStatus, setFooterStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleFooterSub = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = footerEmail.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setFooterStatus("loading");
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: trimmed, is_active: true }, { onConflict: "email" });
    if (!error) {
      toast({ title: "Subscribed! 🎉" });
      setFooterStatus("done");
      setFooterEmail("");
    } else {
      setFooterStatus("idle");
    }
  };

  return (
    <footer className="border-t border-border/50 py-10 sm:py-12">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-10">
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-1.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <rect width="5" height="5" rx="1" fill="hsl(var(--primary))" />
                <rect x="7" width="5" height="5" rx="1" fill="hsl(var(--primary))" />
                <rect x="14" width="5" height="5" rx="1" fill="hsl(var(--primary))" opacity="0.6" />
                <rect y="7" width="5" height="5" rx="1" fill="hsl(var(--primary))" />
                <rect x="7" y="7" width="5" height="5" rx="1" fill="hsl(var(--primary))" opacity="0.8" />
                <rect x="14" y="7" width="5" height="5" rx="1" fill="hsl(var(--primary))" opacity="0.4" />
                <rect y="14" width="5" height="5" rx="1" fill="hsl(var(--primary))" opacity="0.6" />
                <rect x="7" y="14" width="5" height="5" rx="1" fill="hsl(var(--primary))" opacity="0.4" />
                <rect x="14" y="14" width="5" height="5" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
              </svg>
              <span className="font-display text-xl font-bold text-foreground">seats<span className="text-primary">.ca</span></span>
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold">Canada's No Extra Fees Platform</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Not just a seat, an experience. Zero fees on every ticket, every time.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Events</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/teams/mlb/blue-jays" className="hover:text-foreground transition-colors py-1 inline-block">Toronto Blue Jays</Link></li>
              <li><span className="text-muted-foreground/50 italic text-xs">More teams coming soon</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors py-1 inline-block">About Us</Link></li>
              <li><Link to="/membership" className="hover:text-foreground transition-colors py-1 inline-block">Membership</Link></li>
              <li><Link to="/reseller" className="hover:text-foreground transition-colors py-1 inline-block">Become a Seller</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors py-1 inline-block">Contact Us</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors py-1 inline-block">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors py-1 inline-block">Privacy Policy</Link></li>
            </ul>
            <div className="mt-5">
              <h4 className="font-display font-semibold mb-2 text-sm text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Newsletter
              </h4>
              {footerStatus === "done" ? (
                <p className="text-xs text-primary">Subscribed ✓</p>
              ) : (
                <form onSubmit={handleFooterSub} className="flex flex-col gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-card/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-base sm:text-xs"
                    disabled={footerStatus === "loading"}
                  />
                  <button type="submit" className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors min-h-[44px]" disabled={footerStatus === "loading"}>
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 seats.ca — All rights reserved. Made in Canada 🍁</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
