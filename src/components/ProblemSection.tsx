import { ArrowRight, DollarSign, Eye, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
      <div className="container mx-auto px-5 sm:px-6">
        <div className="max-w-2xl mx-auto text-center mb-14 sm:mb-20">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-3 sm:mb-4">The problem</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Buying tickets shouldn't feel like a gamble
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Every other platform is designed to make you pay more than you planned.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-12 max-w-4xl mx-auto mb-12 sm:mb-14">
          {painPoints.map((point, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5 sm:mb-6">
                <point.icon className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />
              </div>
              <h3 className="font-display font-semibold text-lg sm:text-xl mb-2 sm:mb-3">{point.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">{point.description}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row items-center justify-center">
          <Link to="/teams/blue-jays" className="w-full sm:w-auto">
            <Button variant="hero" size="lg" className="w-full sm:w-auto text-base px-10 py-4 h-auto rounded-xl shadow-xl shadow-primary/20 min-h-[52px] font-semibold">
              Search Events
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <button
            onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors py-3"
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
