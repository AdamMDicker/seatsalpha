import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section id="final-cta" className="py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to stop overpaying?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-12 leading-relaxed">
            Browse real prices, compare seats, and pay exactly what's listed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/teams/blue-jays">
              <Button variant="hero" size="lg" className="text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20">
                Browse Tickets
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/membership">
              <Button variant="outline" size="lg" className="text-base px-10 py-4 h-auto rounded-xl">
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
