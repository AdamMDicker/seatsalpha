import { Link } from "react-router-dom";
import { ArrowRight, DollarSign, Eye, XCircle } from "lucide-react";

const painPoints = [
  {
    icon: DollarSign,
    title: "Hidden fees at checkout",
    description: "A $100 ticket becomes $132 after service fees, processing fees, and taxes get added at the end.",
  },
  {
    icon: Eye,
    title: "No way to compare seats",
    description: "Most platforms show a list of prices — not a clear view of what you're actually getting for your money.",
  },
  {
    icon: XCircle,
    title: "No price transparency",
    description: "You never know if you're getting a fair deal because the real cost is hidden until the last step.",
  },
];

const ProblemSection = () => {
  return (
    <section id="problem" className="py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">The problem</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Buying tickets shouldn't feel like a gamble
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Every other platform is designed to make you pay more than you planned.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto mb-14">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="text-center flex flex-col items-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
                <point.icon className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors"
          >
            See how we fix this
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
