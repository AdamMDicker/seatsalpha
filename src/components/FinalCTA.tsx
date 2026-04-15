import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroArena from "@/assets/hero-arena.jpg";

const FinalCTA = () => {
  return (
    <section id="final-cta" className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroArena})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Ready to stop{" "}
            <span className="text-gradient italic">overpaying?</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto mb-10 sm:mb-12 leading-relaxed">
            Browse real prices, compare seats, and pay exactly what's listed.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 items-center justify-center">
            <Link to="/teams/blue-jays" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-lg px-12 py-5 h-auto rounded-xl shadow-xl shadow-primary/25 min-h-[56px] font-bold">
                Browse Blue Jays Tickets
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/membership" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl min-h-[52px] border-primary/30 hover:border-primary/60">
                Learn About Membership
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
