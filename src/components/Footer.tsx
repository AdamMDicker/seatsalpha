import { Ticket, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              <span className="font-display text-lg font-bold">
                seats<span className="text-primary">.ca</span>
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-1">Canada's First No-Fee Platform</p>
            <p className="text-sm text-muted-foreground">
              Not just a seat, an experience. Zero fees on every ticket, every time.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Events</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/events" className="hover:text-foreground transition-colors">Sports</Link></li>
              <li><Link to="/events" className="hover:text-foreground transition-colors">Concerts</Link></li>
              <li><Link to="/events" className="hover:text-foreground transition-colors">Theatre</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/membership" className="hover:text-foreground transition-colors">Membership</Link></li>
              <li><Link to="/reseller" className="hover:text-foreground transition-colors">Become a Seller</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
            <div className="mt-4">
              <h4 className="font-display font-semibold mb-2 text-sm text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-primary" /> Newsletter
              </h4>
              {footerStatus === "done" ? (
                <p className="text-xs text-primary">Subscribed ✓</p>
              ) : (
                <form onSubmit={handleFooterSub} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={footerEmail}
                    onChange={(e) => setFooterEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-md bg-card/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 text-xs"
                    disabled={footerStatus === "loading"}
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors" disabled={footerStatus === "loading"}>
                    Go
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          <p>© 2026 seats.ca — All rights reserved. Made in Canada 🍁</p>
          <p className="mt-2">Site designed by <a href="https://nichewebsites.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NicheWebsites.com</a></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
