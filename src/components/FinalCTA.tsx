import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section id="final-cta" className="py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Ready to stop overpaying for tickets?
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Browse real ticket prices, compare seats, and pay exactly what's listed. No sign-up required to look around.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/teams/blue-jays">
              <Button variant="hero" size="lg" className="text-base px-8 py-4 h-auto">
                Browse Blue Jays Tickets
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/membership">
              <Button variant="outline" size="lg" className="text-base px-8 py-4 h-auto">
                Learn About Membership
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground mt-6">
            Currently in beta · More teams coming soon
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
