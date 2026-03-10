import { Button } from "@/components/ui/button";
import { Search, ShieldCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import heroCanada from "@/assets/hero-arena.jpg";
import heroBaseball from "@/assets/hero-baseball.jpg";
import heroHockey from "@/assets/hero-hockey.jpg";
import heroBasketball from "@/assets/hero-basketball.jpg";
import heroFootball from "@/assets/hero-football.jpg";
import heroSoccer from "@/assets/hero-soccer.jpg";
import heroConcerts from "@/assets/hero-concerts.jpg";

const HERO_IMAGES: Record<string, string> = {
  canada: heroCanada,
  baseball: heroBaseball,
  hockey: heroHockey,
  basketball: heroBasketball,
  football: heroFootball,
  soccer: heroSoccer,
  concerts: heroConcerts,
};

const TEAMS = [
  { name: "Toronto Blue Jays", league: "MLB", path: "/teams/blue-jays" },
];

const HeroSection = () => {
  const [search, setSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [heroImage, setHeroImage] = useState(heroCanada);
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

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image")
        .single();
      if (data && HERO_IMAGES[data.value]) {
        setHeroImage(HERO_IMAGES[data.value]);
      }
    };
    fetchHero();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      {/* Lighter overlays so hero image is visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

      <div className="container mx-auto px-4 relative z-10 pt-20 flex flex-col items-center text-center">
        <div className="max-w-3xl flex flex-col items-center">
          {/* Pay No Fees badge — solid, bright, with pulse glow */}
          <Link
            to="/membership"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground mb-6 animate-pulse-glow hover:brightness-110 transition-all cursor-pointer group shadow-lg"
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-bold tracking-wide">Pay No Fees — Click Here to Learn How</span>
          </Link>

          <p className="text-sm uppercase tracking-[0.3em] text-foreground font-semibold mb-3 animate-fade-in drop-shadow-lg" style={{ animationDelay: "0.05s" }}>
            Canada's First No-Fee Ticket Platform
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-4 animate-fade-in drop-shadow-lg" style={{ animationDelay: "0.1s" }}>
            Not Just a Seat,
            <br />
            <span className="text-gradient">An Experience.</span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/80 max-w-xl mb-8 animate-fade-in drop-shadow-md" style={{ animationDelay: "0.2s" }}>
            Tickets without the fees. 🍁
          </p>

          {/* Search bar — solid light background for visibility */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl w-full mb-10 animate-fade-in relative" style={{ animationDelay: "0.3s" }} ref={resultsRef}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, teams, artists..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-foreground/95 text-background placeholder:text-background/50 border-2 border-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium shadow-xl"
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

          <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="px-5 py-2.5 rounded-lg bg-card border border-border text-sm text-foreground font-medium shadow-lg">
              🚀 We're in beta — currently offering Toronto Blue Jays tickets only. More teams coming soon!
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-foreground/90 cursor-help">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    <span className="underline decoration-dotted underline-offset-4">100% Guaranteed Tickets</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-center">
                  <p>Every ticket is verified authentic. You're covered by our buyer protection — if an event is cancelled, you get a full refund.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
