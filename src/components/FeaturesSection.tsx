import { ShieldCheck, Banknote, Car, Plane } from "lucide-react";

const features = [
  {
    icon: Banknote,
    title: "Zero Fees for Members",
    benefit: "Keep more money in your pocket",
    description: "Members pay the listed ticket price — no HST, no service charges. You'll save $30+ on every purchase.",
  },
  {
    icon: ShieldCheck,
    title: "Every Ticket Guaranteed",
    benefit: "Buy with total confidence",
    description: "Every ticket is verified authentic. If an event is cancelled, you get a full refund — no questions asked.",
  },
  {
    icon: Plane,
    title: "Travel Packages",
    benefit: "Save on the whole trip",
    description: "Travelling for the game? Bundle hotel and flight deals at checkout so you save beyond just the ticket.",
  },
  {
    icon: Car,
    title: "Ride to the Venue",
    benefit: "One less thing to plan",
    description: "Add an Uber ride to and from your event at checkout. Get dropped off at the door, stress-free.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Why Seats.ca</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Built for fans, not for fees
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Everything you need for a better ticket-buying experience — and nothing you don't.
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
              <h3 className="font-display font-semibold text-xl mb-1">{feature.title}</h3>
              <p className="text-sm font-medium text-primary mb-3">{feature.benefit}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
