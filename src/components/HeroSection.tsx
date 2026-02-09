import { Button } from "@/components/ui/button";
import { Search, ShieldCheck, MapPin } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-arena.jpg";

const HeroSection = () => {
  const [search, setSearch] = useState("");

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent" />

      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6 animate-fade-in">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Canada's First No-Fee Ticket Platform</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Not Just a Seat,
            <br />
            <span className="text-gradient">An Experience.</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Zero fees. Real savings. The way buying tickets in Canada should be.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, teams, artists..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-card/80 backdrop-blur border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <Button variant="hero" className="px-6 py-3 h-auto">
              Search
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span>All Major Canadian Cities</span>
            </div>
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
