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
    <section id="problem" className="py-20 sm:py-32">
      <div className="container mx-auto px-5 sm:px-6 text-center">
        <div className="max-w-2xl mx-auto mb-14 sm:mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-green-400 font-semibold mb-3 sm:mb-4">The problem</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Buying tickets shouldn't feel like a gamble
          </h2>
          <p className="text-green-400 text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Every other platform is designed to make you pay more than you planned.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-8 max-w-5xl mx-auto mb-12 sm:mb-14">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="flex flex-col items-start text-left rounded-2xl p-7 sm:p-8 bg-card border border-red-500/20 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-destructive/10 flex items-center justify-center mb-5 sm:mb-6">
                <point.icon className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg sm:text-xl mb-2 sm:mb-3">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        <div>
          <button
            onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-base font-semibold text-green-400 hover:underline underline-offset-4 transition-colors py-3"
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
