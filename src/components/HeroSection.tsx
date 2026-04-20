import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import heroStadium from "@/assets/hero-stadium.webp";

const HeroSection = () => {
  const [heroImage, setHeroImage] = useState(heroStadium);

  useEffect(() => {
    const fetchHero = async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "hero_image").single();
      if (data?.value && data.value !== "default") {
        // Dynamic imports could be added here for other hero images
      }
    };
    fetchHero();
  }, []);

  return (
    <section className="relative min-h-[70vh] sm:min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url(${heroImage})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10 pt-20 sm:pt-28 pb-12 sm:pb-20 flex flex-col items-start text-left">
        <div className="max-w-2xl w-full flex flex-col items-start">
          {/* Descriptor badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-red-500/30 mb-4 sm:mb-8 animate-fade-in">
            <span className="text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-wide">CA</span>
            <span className="text-[10px] sm:text-xs font-semibold text-red-400">Canada's fee-free ticket marketplace</span>
          </div>

          <h1 className="font-display text-[2.25rem] sm:text-5xl md:text-[4.5rem] font-bold leading-[1.05] sm:leading-[1.1] mb-4 sm:mb-6 animate-fade-in">
            Compare Every
            <br />
            Seat.
            <br />
            <span className="text-red-500 italic">Skip Every Fee.</span>
          </h1>

          <p className="text-sm sm:text-lg md:text-xl text-green-400 max-w-lg mb-6 sm:mb-10 animate-fade-in leading-snug sm:leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Browse real ticket prices by section and row. Members pay exactly what's listed — no service fees, no LCC on top.
          </p>

          {/* CTAs */}
          <div className="w-full animate-fade-in flex flex-col items-start gap-3 sm:flex-row sm:justify-start" style={{ animationDelay: "0.2s" }}>
            <Link to="/teams/blue-jays" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 h-auto rounded-xl shadow-xl min-h-[52px] sm:min-h-[56px] font-bold bg-red-500 hover:bg-red-600 text-white">
                Browse Blue Jays Tickets
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/membership" className="w-full sm:w-auto hidden sm:block">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-5 h-auto rounded-xl min-h-[56px] border-white/10 hover:border-white/25 text-foreground">
                How Membership Works
              </Button>
            </Link>
            {/* Mobile: demote secondary CTA to text link */}
            <Link to="/membership" className="sm:hidden text-sm font-medium text-foreground/70 underline underline-offset-4 px-1 mt-1">
              How membership works →
            </Link>
          </div>

          <p className="text-[11px] sm:text-xs text-green-400 mt-4 sm:mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Starting with Toronto Blue Jays · More teams launching soon
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
