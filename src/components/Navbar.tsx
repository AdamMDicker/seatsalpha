import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Ticket, LogOut, Shield, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MLB_TEAMS = [
  { name: "Toronto Blue Jays", path: "/teams/blue-jays" },
];

const LEAGUES_WITH_DROPDOWNS: Record<string, { name: string; path: string }[]> = {
  MLB: MLB_TEAMS,
};

const LEAGUES = ["NHL", "NBA", "MLB", "NFL", "MLS", "CFL", "Theatre", "Comedy", "Concerts"];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            <Link to="/membership" className="text-sm font-semibold text-gold hover:text-gold/80 transition-colors">
              Membership
            </Link>
            <Link to="/reseller" className="text-sm font-semibold text-gold hover:text-gold/80 transition-colors">
              Resellers
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6" ref={dropdownRef}>
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              All Events
            </Link>
            {LEAGUES.map((league) => {
              const teams = LEAGUES_WITH_DROPDOWNS[league];
              if (teams) {
                return (
                  <div key={league} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === league ? null : league)}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {league}
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === league ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === league && (
                      <div className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl z-50 py-2 animate-fade-in">
                        {teams.map((team) => (
                          <Link
                            key={team.path}
                            to={team.path}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-4 py-2.5 text-sm text-foreground hover:bg-secondary hover:text-primary transition-colors"
                          >
                            {team.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={league}
                  to={`/?category=${league.toLowerCase()}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {league}
                </Link>
              );
            })}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-gold hover:text-gold/80 transition-colors flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            {user && (
              <Link to="/reseller" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Reseller
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
