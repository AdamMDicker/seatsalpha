import { Banknote, ShieldCheck, Plane, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Keep more money for the things you love",
    description: "Members pay exactly what's listed — no service fees, no LCC added at checkout. Most fans save $30+ per ticket.",
  },
  {
    icon: ShieldCheck,
    title: "Buy with confidence, every single time",
    description: "Every ticket is verified authentic. If your event gets cancelled, you get a full refund — no forms, no waiting.",
  },
  {
    icon: Plane,
    title: "Save on the whole trip, not just the ticket",
    description: "Travelling for the game? Bundle discounted hotel and flight deals at checkout so your entire trip costs less.",
  },
  {
    icon: Car,
    title: "Get to the venue without the hassle",
    description: "Add a round-trip Uber ride at checkout. No parking, no stress — just show up and enjoy.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="text-center mb-14 sm:mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 sm:mb-4">Why fans choose us</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            A better way to buy tickets
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Every feature saves you money, time, or stress. Usually all three.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-8 max-w-3xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 sm:p-10 bg-card border border-white/5 hover:border-white/10 transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-500/15 flex items-center justify-center mb-5 sm:mb-6 group-hover:bg-green-500/20 transition-colors">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg mb-2 sm:mb-3 leading-snug">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link to="/teams/blue-jays" className="w-full sm:w-auto inline-block">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20 min-h-[52px] font-semibold">
              Browse Available Tickets
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
