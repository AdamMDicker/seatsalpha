import { Ticket } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
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
            <p className="text-sm text-muted-foreground">
              Canada's first no-fee ticket platform. Not just a seat, an experience.
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
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2026 seats.ca — All rights reserved. Made in Canada 🍁
        </div>
      </div>
    </footer>
  );
};

export default Footer;
