import { Search, LayoutGrid, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Search,
    number: "1",
    title: "Find your event",
    description: "Search by team, date, or venue to find upcoming games.",
  },
  {
    icon: LayoutGrid,
    number: "2",
    title: "Pick your seats",
    description: "Compare sections, rows, and prices side by side.",
  },
  {
    icon: CreditCard,
    number: "3",
    title: "Pay the listed price",
    description: "No surprise fees at checkout. What you see is what you pay.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Three steps. Zero fees.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-5 relative">
                <step.icon className="h-6 w-6 text-primary" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/teams/blue-jays">
            <Button variant="hero" size="lg">Browse Events</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
