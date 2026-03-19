import { Star, ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Marcus T.",
    location: "Toronto, ON",
    quote: "I saved $64 on two Blue Jays tickets. The price I saw was the price I paid — no last-minute fees.",
    event: "Blue Jays vs Yankees",
    saved: "$64",
  },
  {
    name: "Sarah L.",
    location: "Vancouver, BC",
    quote: "Finally a ticket site that doesn't try to trick you at checkout. The membership paid for itself after one game.",
    event: "Canucks vs Oilers",
    saved: "$48",
  },
  {
    name: "James R.",
    location: "Calgary, AB",
    quote: "Comparing seats side by side made it so easy to pick the best value. Way better than scrolling through endless listings.",
    event: "Flames vs Leafs",
    saved: "$37",
  },
  {
    name: "Priya D.",
    location: "Mississauga, ON",
    quote: "The Uber add-on at checkout was genius. No parking stress, and we saved on fees too. Will never use StubHub again.",
    event: "Raptors vs Celtics",
    saved: "$52",
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
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Join thousands of Canadian fans who stopped overpaying for tickets.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-8 sm:p-12 text-center relative">
            <Quote className="h-8 w-8 text-primary/20 mx-auto mb-4" />
            <p className="text-base sm:text-lg text-foreground/90 leading-relaxed mb-6 font-medium italic">
              "{testimonials[0].quote}"
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {testimonials[0].name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{testimonials[0].name}</p>
                <p className="text-xs text-muted-foreground">{testimonials[0].location} · Saved {testimonials[0].saved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of testimonials */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8 max-w-5xl mx-auto">
          {testimonials.slice(1).map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-7 sm:p-10 flex flex-col animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-0.5 mb-4 sm:mb-5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-5 sm:mb-6">
                "{t.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.event}</span>
                <span className="text-xs font-bold text-primary">Saved {t.saved}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof nudge */}
        <div className="text-center mt-10 sm:mt-14">
          <p className="text-sm text-muted-foreground mb-6">
            ⭐ Rated <span className="font-bold text-foreground">4.9/5</span> by early members · Trusted by fans in <span className="font-bold text-foreground">50+ cities</span> across Canada
          </p>
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
