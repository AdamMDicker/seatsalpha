import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket, LogOut, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Ticket className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold tracking-tight">
                seats<span className="text-primary">.ca</span>
              </span>
            </Link>
            <a href="/#membership" className="text-sm font-semibold text-white hover:text-primary transition-colors">
              Membership
            </a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              All Events
            </Link>
            {["NHL", "NBA", "MLB", "NFL", "MLS", "CFL", "Theatre", "Comedy", "Concerts"].map((league) => (
              <Link
                key={league}
                to={`/?category=${league.toLowerCase()}`}
                className="text-sm font-semibold text-white hover:text-primary transition-colors"
              >
                {league}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{user.email}</span>
                <Button variant="glass" size="sm" onClick={signOut}>
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="hero" size="sm">Sign In</Button>
              </Link>
            )}
          </div>

          <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <Link to="/" className="block py-2 text-sm text-muted-foreground hover:text-foreground">Events</Link>
            {isAdmin && <Link to="/admin" className="block py-2 text-sm text-gold">Admin Dashboard</Link>}
            {user ? (
              <Button variant="glass" size="sm" className="w-full" onClick={signOut}>Sign Out</Button>
            ) : (
              <Link to="/auth"><Button variant="hero" size="sm" className="w-full">Sign In</Button></Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
