import { Search, LayoutGrid, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Search for your event",
    description: "Type in a team name, artist, or date. We'll show you every upcoming event with tickets available.",
  },
  {
    icon: LayoutGrid,
    number: "2",
    title: "Compare seats and views",
    description: "See every section, row, and price laid out clearly. No guessing — you'll know exactly what you're getting.",
  },
  {
    icon: ThumbsUp,
    number: "3",
    title: "Pick the best option for your budget",
    description: "Choose the seats that work for you and pay the listed price. Members pay zero fees on top.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Three steps to better tickets
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            No account needed to browse. Just search, compare, and pick.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px bg-border" />

            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center px-4 animate-fade-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* Number circle */}
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6 relative z-10">
                  <step.icon className="h-8 w-8 text-primary" />
                  <span className="absolute -top-1.5 -right-1.5 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/25">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/teams/blue-jays">
            <Button variant="hero" size="lg" className="text-base px-8 py-3.5 h-auto">
              Try It — Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
