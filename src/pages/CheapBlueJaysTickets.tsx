import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Ticket,
  ShieldCheck,
  DollarSign,
  Star,
  CheckCircle2,
  TrendingDown,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";

import heroBaseball from "@/assets/hero-baseball.jpg";
import blueJaysLogo from "@/assets/teams/mlb/blue-jays.png";

const BENEFITS = [
  { icon: DollarSign, title: "Zero Service Fees", desc: "Members pay exactly what's listed — no surprise charges at checkout." },
  { icon: ShieldCheck, title: "Verified Sellers Only", desc: "Every ticket comes from a vetted reseller with transfer guarantees." },
  { icon: TrendingDown, title: "Below Face Value Deals", desc: "Compare prices across sellers to find seats cheaper than the box office." },
  { icon: Users, title: "Section & Row Comparison", desc: "Browse by section and row so you know exactly what you're paying for." },
];

const COMPARISONS = [
  { platform: "StubHub", section: "118L", row: "25", price: "$89", fees: "$24", total: "$113" },
  { platform: "Ticketmaster", section: "118L", row: "25", price: "$82", fees: "$19", total: "$101" },
  { platform: "Seats.ca", section: "118L", row: "25", price: "$74", fees: "$0", total: "$74", highlight: true },
];

const FAQS = [
  { q: "Where can I find cheap Blue Jays tickets?", a: "Seats.ca lets you compare ticket prices by section and row from multiple sellers. Members pay $0 in fees, so the listed price is the final price — often making us the cheapest option for Blue Jays games at Rogers Centre." },
  { q: "Are the tickets legitimate?", a: "Yes. Every listing on Seats.ca comes from a verified reseller. Tickets are transferred directly via the official platform (e.g. Ticketmaster account-to-account), so you'll have real, scannable tickets in your account before game day." },
  { q: "How much can I save vs StubHub or Ticketmaster?", a: "Service fees on other platforms typically add 20-30% on top of the listed price. With a Seats.ca membership, you pay $0 in service fees and $0 in LCC — saving $15-$40+ per ticket on most Blue Jays games." },
  { q: "What sections are available?", a: "We carry inventory across all Rogers Centre sections — from the 100-level infield and outfield to the 200-level and 500-level upper decks. You can filter by section, row, and budget." },
  { q: "Is there a money-back guarantee?", a: "If your event is cancelled and not rescheduled, you receive a full refund. We also guarantee your tickets will be valid for entry." },
];

const CheapBlueJaysTickets = () => {
  useEffect(() => {
    document.title = "Cheap Blue Jays Tickets Toronto | No-Fee Prices | Seats.ca";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Find cheap Toronto Blue Jays tickets with $0 service fees. Compare prices by section and row at Rogers Centre. Members save $15-40+ per ticket vs StubHub & Ticketmaster."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBaseball})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/40" />

        <div className="container mx-auto px-5 sm:px-6 relative z-10 pt-28 pb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur border border-border/50 mb-6 animate-fade-in">
            <Ticket className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground/80">Toronto's #1 no-fee ticket marketplace</span>
          </div>

          <h1 className="font-display text-[2.25rem] sm:text-5xl md:text-[4rem] font-bold leading-[1.1] mb-5 animate-fade-in">
            Cheap Blue Jays Tickets
            <br />
            <span className="text-gradient">Without the Hidden Fees</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-xl mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Compare real prices by section and row at Rogers Centre. Members pay exactly what's listed — no service fees, no LCC on top. Save $15–$40+ per ticket.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link to="/teams/blue-jays" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-lg px-10 py-5 h-auto rounded-xl shadow-xl shadow-primary/25 min-h-[56px] font-bold">
                Browse Blue Jays Tickets
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/membership" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-5 h-auto rounded-xl min-h-[56px] border-primary/30 hover:border-primary/60">
                How Membership Works
              </Button>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-card/50 backdrop-blur border border-border/40 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <span className="text-base leading-none">🇨🇦</span>
            <span className="text-xs font-semibold text-foreground/80">All prices in <span className="text-primary font-bold">CAD</span></span>
          </div>
        </div>
      </section>

      {/* Price Comparison */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              See How Much You <span className="text-gradient">Actually Save</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Same seats, same game — drastically different final prices. Here's a real example.
            </p>
          </div>

          <div className="max-w-2xl mx-auto grid gap-4">
            {COMPARISONS.map((c) => (
              <Card
                key={c.platform}
                className={`transition-all duration-200 ${
                  c.highlight
                    ? "border-primary/60 shadow-lg shadow-primary/10 bg-primary/5"
                    : "border-border/50"
                }`}
              >
                <CardContent className="p-5 sm:p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {c.highlight && <img src={blueJaysLogo} alt="Seats.ca" className="h-8 w-8 shrink-0" />}
                    <div>
                      <p className={`font-semibold text-sm sm:text-base ${c.highlight ? "text-primary" : "text-foreground"}`}>
                        {c.platform}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Sec {c.section} · Row {c.row}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="text-sm font-medium">{c.price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Fees</p>
                      <p className={`text-sm font-medium ${c.highlight ? "text-green-500" : "text-destructive"}`}>
                        {c.fees === "$0" ? "$0" : `+${c.fees}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className={`text-base font-bold ${c.highlight ? "text-primary" : ""}`}>{c.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            * Example pricing for illustration. Actual prices vary by game and availability.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 sm:py-28 bg-card/30">
        <div className="container mx-auto px-5 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Why Fans Choose Seats.ca
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
              The smartest way to buy Blue Jays tickets in Toronto.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {BENEFITS.map((b, i) => (
              <Card key={b.title} className="border-border/50 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <CardContent className="p-6 flex gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
            3 Steps to Cheaper Tickets
          </h2>

          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { step: "1", icon: MapPin, title: "Pick Your Game", desc: "Browse the full 2025 Blue Jays schedule at Rogers Centre." },
              { step: "2", icon: Calendar, title: "Compare by Section", desc: "See real prices from multiple sellers, sorted by section and row." },
              { step: "3", icon: CheckCircle2, title: "Buy Fee-Free", desc: "Members pay $0 in fees. Tickets transfer directly to your account." },
            ].map((s, i) => (
              <div key={s.step} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary mb-2">STEP {s.step}</span>
                <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/teams/blue-jays">
              <Button variant="hero" size="lg" className="text-lg px-10 py-5 h-auto rounded-xl shadow-xl shadow-primary/25 min-h-[56px] font-bold">
                Find Cheap Tickets Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 sm:py-28 bg-card/30">
        <div className="container mx-auto px-5 sm:px-6 max-w-3xl">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
            What Fans Are Saying
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { name: "Jordan M.", loc: "Toronto, ON", quote: "Saved $35 per ticket on a Saturday game. Couldn't believe the price difference vs StubHub.", saved: "$70 saved" },
              { name: "Priya S.", loc: "Mississauga, ON", quote: "I compared section 118 across three sites. Seats.ca was cheaper even before factoring in fees.", saved: "$52 saved" },
              { name: "Marcus L.", loc: "Brampton, ON", quote: "The transfer was instant. Had the tickets in my Ticketmaster account within minutes.", saved: "$38 saved" },
              { name: "Sarah K.", loc: "Hamilton, ON", quote: "Finally a site that doesn't hit you with hidden fees at checkout. What you see is what you pay.", saved: "$44 saved" },
            ].map((t, i) => (
              <Card key={t.name} className="border-border/50 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.loc}</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{t.saved}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-6 max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border-b border-border/50 pb-6">
                <h3 className="font-semibold text-sm sm:text-base mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-card/30">
        <div className="container mx-auto px-5 sm:px-6 max-w-2xl text-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Stop Overpaying for Blue Jays Tickets
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto mb-10 leading-relaxed">
            Compare every seat at Rogers Centre. Pay exactly what's listed. Join thousands of fans saving $15–$40+ per ticket.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Link to="/teams/blue-jays">
              <Button variant="hero" size="lg" className="text-lg px-12 py-5 h-auto rounded-xl shadow-xl shadow-primary/25 min-h-[56px] font-bold">
                Browse Cheap Tickets
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/membership">
              <Button variant="outline" size="lg" className="text-base px-10 py-4 h-auto rounded-xl min-h-[52px] border-primary/30 hover:border-primary/60">
                Learn About Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Cheap Blue Jays Tickets Toronto",
            description: "Find cheap Toronto Blue Jays tickets with $0 service fees at Seats.ca.",
            url: "https://seats.ca/cheap-blue-jays-tickets",
            publisher: {
              "@type": "Organization",
              name: "Seats.ca",
              url: "https://seats.ca",
            },
          }),
        }}
      />

      <Footer />
    </div>
  );
};

export default CheapBlueJaysTickets;
