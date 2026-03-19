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
  canada: heroCanada, baseball: heroBaseball, hockey: heroHockey,
  basketball: heroBasketball, football: heroFootball, soccer: heroSoccer,
  concerts: heroConcerts, stpatricks: heroStPatricks,
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
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "hero_image").single();
      if (data && HERO_IMAGES[data.value]) setHeroImage(HERO_IMAGES[data.value]);
    };
    fetchHero();
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10 pt-24 sm:pt-28 pb-16 sm:pb-20 flex flex-col items-center text-center">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <h1 className="font-display text-[2.5rem] sm:text-5xl md:text-[4.5rem] font-bold leading-[1.1] mb-6 sm:mb-8 animate-fade-in">
            Compare Every Seat.
            <br />
            <span className="text-gradient">Skip Every Fee.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-md mb-8 sm:mb-12 animate-fade-in leading-relaxed px-2" style={{ animationDelay: "0.1s" }}>
            See real ticket prices across sections and rows. Members never pay service fees or HST.
          </p>

          {/* Search */}
          <div className="w-full max-w-lg mb-8 sm:mb-10 animate-fade-in relative" style={{ animationDelay: "0.2s" }} ref={resultsRef}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by team or event..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  className="w-full pl-11 pr-4 py-4 rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-base sm:text-sm text-foreground placeholder:text-muted-foreground"
                />
                {showResults && filtered.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl shadow-2xl z-50 py-2 animate-fade-in">
                    {filtered.map((team) => (
                      <button
                        key={team.path}
                        onClick={() => { navigate(team.path); setShowResults(false); setSearch(""); }}
                        className="w-full text-left px-4 py-3.5 hover:bg-secondary transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{team.name}</p>
                          <p className="text-xs text-muted-foreground">{team.league} · View tickets</p>
                        </div>
                        <span className="text-xs font-medium text-primary">→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="hero" className="px-8 py-4 h-auto text-base sm:text-sm font-semibold rounded-xl min-h-[52px]">
                Search
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="w-full animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/teams/blue-jays" className="block">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20 min-h-[52px]">
                Find Blue Jays Tickets from $18
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              Currently in beta · More teams coming soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
