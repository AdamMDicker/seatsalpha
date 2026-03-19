import { Link } from "react-router-dom";
import { ArrowRight, XCircle, DollarSign, Eye } from "lucide-react";

const painPoints = [
  {
    icon: DollarSign,
    title: "Hidden fees at checkout",
    description: "You find a $100 ticket, but by the time you check out it's $132. Service fees, processing fees, and taxes pile up.",
  },
  {
    icon: Eye,
    title: "No way to compare seats",
    description: "Most platforms show you a list of prices — not a clear view of what you're actually getting for your money.",
  },
  {
    icon: XCircle,
    title: "No price transparency",
    description: "You never know if you're getting a good deal because the real cost is hidden until the last step.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="py-28">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">The problem</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-5">
            Buying tickets shouldn't feel like a gamble
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Every other platform is designed to make you pay more than you planned. Here's what you're up against.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="text-center flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
                <point.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="#solution"
            onClick={(e) => { e.preventDefault(); document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" }); }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            See how we fix this
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
