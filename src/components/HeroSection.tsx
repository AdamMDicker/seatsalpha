import { Button } from "@/components/ui/button";
import { Search, ShieldCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import heroImage from "@/assets/hero-arena.jpg";

const TEAMS = [
  { name: "Toronto Blue Jays", league: "MLB", path: "/teams/blue-jays" },
];

const HeroSection = () => {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = search.trim().length > 1
    ? TEAMS.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.league.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

      <div className="container mx-auto px-4 relative z-10 pt-20 flex flex-col items-center text-center">
        <div className="max-w-3xl flex flex-col items-center">
          <Link to="/membership" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6 animate-fade-in hover:bg-primary/25 transition-colors cursor-pointer group">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Pay No Fees — Click Here to Learn How</span>
          </Link>

          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            Canada's First No-Fee Ticket Platform
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Not Just a Seat,
            <br />
            <span className="text-gradient">An Experience.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            The price you see is the price you pay. No service fees, no surprises — ever. 🍁
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mb-10 animate-fade-in relative" style={{ animationDelay: "0.3s" }} ref={resultsRef}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, teams, artists..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card/80 backdrop-blur border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
              {showResults && filtered.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-xl z-50 py-2 animate-fade-in">
                  {filtered.map((team) => (
                    <button
                      key={team.path}
                      onClick={() => { navigate(team.path); setShowResults(false); setSearch(""); }}
                      className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{team.name}</p>
                        <p className="text-xs text-muted-foreground">{team.league} · View schedule & tickets</p>
                      </div>
                      <span className="text-xs font-medium text-primary">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="hero" className="px-6 py-3 h-auto">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>100% Guaranteed Tickets</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
