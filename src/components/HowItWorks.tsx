import { Search, LayoutGrid, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Search for your event",
    description: "Type in a team name, artist, or date. We'll show you every upcoming event with available tickets.",
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
    <section id="how-it-works" className="py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">How it works</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Three steps to better tickets
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-sm mx-auto leading-relaxed">
            No account needed to browse. Just search, compare, and pick.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 relative">
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-px bg-border/50" />

            {steps.map((step, i) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center px-6 animate-fade-in"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="w-24 h-24 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center mb-8 relative z-10">
                  <step.icon className="h-9 w-9 text-primary" />
                  <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg shadow-primary/25">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/teams/blue-jays">
            <Button variant="hero" size="lg" className="text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20">
              Try It — Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
