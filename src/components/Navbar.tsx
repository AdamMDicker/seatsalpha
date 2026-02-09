import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Ticket className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold tracking-tight">
              seats<span className="text-primary">.ca</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Events
            </Link>
            <Link to="/membership" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Membership
            </Link>
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Button variant="hero" size="sm">
              Find Tickets
            </Button>
          </div>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <Link to="/events" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
              Events
            </Link>
            <Link to="/membership" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
              Membership
            </Link>
            <Link to="/about" className="block py-2 text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Button variant="hero" size="sm" className="w-full">
              Find Tickets
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
