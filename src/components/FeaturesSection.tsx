import { Banknote, ShieldCheck, Plane, Car } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Keep more money for the things you love",
    description: "Members pay exactly what's listed — no service fees, no HST added at checkout. Most fans save $30+ per ticket.",
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
    <section id="features" className="py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Why fans choose us</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            A better way to buy tickets
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Every feature saves you money, time, or stress. Usually all three.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-10 bg-card border border-border hover:border-primary/30 transition-all duration-300 animate-fade-in group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-3 leading-snug">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
