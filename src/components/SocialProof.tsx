import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    location: "Toronto, ON",
    quote: "I saved $64 on two Blue Jays tickets. The price I saw was the price I paid — no last-minute fees.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    location: "Vancouver, BC",
    quote: "Finally a ticket site that doesn't try to trick you at checkout. The membership paid for itself after one game.",
    rating: 5,
  },
  {
    name: "James R.",
    location: "Calgary, AB",
    quote: "Comparing seats side by side made it so easy to pick the best value. Way better than scrolling through endless listings.",
    rating: 5,
  },
];

const SocialProof = () => {
  return (
    <section id="social-proof" className="py-28 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">What fans are saying</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Real savings, real fans
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Join thousands of Canadians who are done overpaying for tickets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-8 flex flex-col animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>
              <div>
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
