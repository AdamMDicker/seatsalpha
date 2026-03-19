import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Marcus T.",
    location: "Toronto, ON",
    quote: "I saved $64 on two Blue Jays tickets. The price I saw was the price I paid — no last-minute fees.",
  },
  {
    name: "Sarah L.",
    location: "Vancouver, BC",
    quote: "Finally a ticket site that doesn't try to trick you at checkout. The membership paid for itself after one game.",
  },
  {
    name: "James R.",
    location: "Calgary, AB",
    quote: "Comparing seats side by side made it so easy to pick the best value. Way better than scrolling through endless listings.",
  },
];

const SocialProof = () => {
  return (
    <section id="social-proof" className="py-20 sm:py-32 bg-card/20">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="text-center mb-14 sm:mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 sm:mb-4">What fans are saying</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Real savings, real fans
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-7 sm:p-10 flex flex-col animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-0.5 mb-4 sm:mb-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-6 sm:mb-8">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.location}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link to="/teams/blue-jays" className="w-full sm:w-auto inline-block">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20 min-h-[52px] font-semibold">
              Search Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
