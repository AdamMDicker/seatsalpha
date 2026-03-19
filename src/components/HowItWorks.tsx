import { Search, LayoutGrid, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Find your event",
    description: "Search by team, date, or venue to find upcoming games and events near you.",
  },
  {
    icon: LayoutGrid,
    number: "2",
    title: "Compare your seats",
    description: "See every available section, row, and price side by side so you know exactly what you're getting.",
  },
  {
    icon: CreditCard,
    number: "3",
    title: "Pay the listed price",
    description: "No service fees, no processing charges, no HST on top. The price you see is the price you pay.",
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
            No account needed to browse. Membership unlocks fee-free pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto mb-14">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="text-center flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 relative">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                  {step.number}
                </span>
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Connector line on desktop */}
        <div className="text-center">
          <Link to="/teams/blue-jays">
            <Button variant="hero" size="lg" className="text-base px-8 py-3.5 h-auto">
              Try It Now — Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
