import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import heroCanada from "@/assets/hero-arena.jpg";
import heroBaseball from "@/assets/hero-baseball.jpg";
import heroHockey from "@/assets/hero-hockey.jpg";
import heroBasketball from "@/assets/hero-basketball.jpg";
import heroFootball from "@/assets/hero-football.jpg";
import heroSoccer from "@/assets/hero-soccer.jpg";
import heroConcerts from "@/assets/hero-concerts.jpg";
import heroStPatricks from "@/assets/hero-stpatricks.jpg";

const HERO_IMAGES: Record<string, string> = {
  canada: heroCanada,
  baseball: heroBaseball,
  hockey: heroHockey,
  basketball: heroBasketball,
  football: heroFootball,
  soccer: heroSoccer,
  concerts: heroConcerts,
  stpatricks: heroStPatricks,
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
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-background/40" />

      <div className="container mx-auto px-4 relative z-10 pt-24 pb-16 flex flex-col items-center text-center">
        <div className="max-w-2xl flex flex-col items-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.1] mb-6 animate-fade-in drop-shadow-lg">
            Compare Every Seat.
            <br />
            <span className="text-gradient">Skip Every Fee.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/80 max-w-lg mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Seats.ca shows you real ticket prices across sections and rows — and members never pay service fees or HST on top. You save $30+ per ticket, every time.
          </p>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl w-full mb-6 animate-fade-in relative" style={{ animationDelay: "0.2s" }} ref={resultsRef}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by team, event, or artist..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                className="w-full pl-10 pr-4 py-3.5 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium text-foreground placeholder:text-muted-foreground shadow-xl"
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
            <Button variant="hero" className="px-6 py-3.5 h-auto">
              Search
            </Button>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col items-center gap-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/teams/blue-jays">
              <Button variant="hero" size="lg" className="text-base px-8 py-3.5 h-auto">
                Find Blue Jays Tickets from $18
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Currently in beta · More teams coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
