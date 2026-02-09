import { ShieldCheck, Banknote, Car, Plane } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Zero Fees",
    description: "The price you see is the price you pay. No hidden charges, no surprises at checkout.",
  },
  {
    icon: ShieldCheck,
    title: "100% Guaranteed",
    description: "Every ticket is verified and guaranteed authentic. Your purchase is always protected.",
  },
  {
    icon: Plane,
    title: "Travel Packages",
    description: "Travelling for the event? We'll bundle hotel and flight deals to save you even more.",
  },
  {
    icon: Car,
    title: "Ride to the Venue",
    description: "Add an Uber ride is available to and from your event at checkout for a seamless experience.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Why <span className="text-gradient">seats.ca</span>?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Built for Canadians who are tired of paying unfair ticket fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="glass rounded-xl p-6 text-center hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
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
