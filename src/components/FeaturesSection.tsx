import { ShieldCheck, Banknote, Car, Plane } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Zero Fees",
    description: "Members pay the listed ticket price. No HST, no service charges, no surprises at checkout.",
  },
  {
    icon: ShieldCheck,
    title: "100% Guaranteed",
    description: "Every ticket is verified authentic and backed by our buyer protection policy.",
  },
  {
    icon: Plane,
    title: "Travel Packages",
    description: "Travelling for the game? We bundle hotel and flight deals so you save even more.",
  },
  {
    icon: Car,
    title: "Ride to the Venue",
    description: "Add an Uber ride to and from your event at checkout — one less thing to worry about.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Why Seats.ca</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Built for fans who are tired of unfair fees
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need for a better ticket-buying experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="rounded-xl p-6 text-center bg-card border border-border shadow-lg hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
