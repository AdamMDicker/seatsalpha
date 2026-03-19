import { Banknote, ShieldCheck, Plane, Car } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Keep more money for the things you love",
    description: "Members pay exactly what's listed — no service fees, no HST added at checkout. Most fans save $30+ per ticket compared to other platforms.",
  },
  {
    icon: ShieldCheck,
    title: "Buy with confidence, every single time",
    description: "Every ticket is verified authentic before it reaches you. If your event gets cancelled, you get a full refund automatically — no forms, no waiting.",
  },
  {
    icon: Plane,
    title: "Save on the whole trip, not just the ticket",
    description: "Travelling to catch the game? Bundle discounted hotel and flight deals at checkout so your entire trip costs less.",
  },
  {
    icon: Car,
    title: "Get to the venue without the hassle",
    description: "Add a round-trip Uber ride at checkout and get dropped off at the door. No parking, no stress — just show up and enjoy.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Why fans choose us</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            A better way to buy tickets
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Every feature exists to save you money, time, or stress. Usually all three.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-in group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
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
