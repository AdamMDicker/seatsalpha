import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Ticket, Heart, MapPin, Users, Target, Shield } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
            <Ticket className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Our Story</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
            About <span className="text-gradient">seats.ca</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We started seats.ca because we believe Canadians deserve better. Better prices, better transparency, and a better way to experience the events they love — without being nickel-and-dimed at every turn.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">The Problem We Set Out to Solve</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If you've ever bought tickets online in Canada, you already know the frustration. You find the perfect seats, get excited, head to checkout — and suddenly the price has jumped 25%, sometimes even 30%. Service fees. Processing fees. Facility charges. Order fees. The list goes on, and every major platform does it.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For a family of four going to a Blue Jays game, that can mean an extra $50 to $80 in fees alone — money that could have gone toward parking, food, or simply staying within budget. For concert-goers, hockey fans, and anyone who just wants to enjoy live entertainment, these hidden costs have become an accepted part of the experience. We don't think they should be.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That frustration is exactly what drove us to build seats.ca. We asked a simple question: <strong className="text-foreground">what if there was a platform where the price you see is actually the price you pay?</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              seats.ca was founded with a single, clear mission: <strong className="text-foreground">to give Canadians access to live event tickets without the burden of unfair service fees.</strong> We believe that going to a game, a concert, or a show should be accessible and affordable — and that starts with honest, transparent pricing.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We're not trying to reinvent the wheel. We're trying to fix what's broken. The ticketing industry in Canada has long been dominated by a handful of massive platforms that have normalized hidden fees as a revenue stream. Canadians have been paying more than they should for years, and most don't even realize how much of their purchase is going toward fees rather than the actual ticket.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our membership model is what makes this possible. For just $49.95 a year, members pay zero service fees on every single purchase. No catches, no fine print. The average Canadian sports fan attends multiple events a year — which means most members save back the cost of their membership on their very first purchase, and everything after that is pure savings.
            </p>
          </div>
        </div>
      </section>

      {/* Built for Canadians */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Built for Canadians, by Canadians</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              seats.ca isn't a Silicon Valley startup trying to break into the Canadian market. We're a Canadian company, built from the ground up with Canadian fans in mind. We understand the landscape — from the passion of Leafs Nation to the energy of a packed SkyDome on a summer night, from sold-out Drake concerts to playoff hockey that brings entire cities together.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We price everything in Canadian dollars. We understand Canadian tax law. We know what it's like to budget for a night out in Toronto, Vancouver, Montreal, or Calgary — and we've designed our platform to make that experience better, not more expensive.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a die-hard season ticket holder, a casual fan looking for a fun weekend outing, or a traveller visiting Canada and wanting to catch a game, seats.ca is built to serve you with fairness and transparency at its core.
            </p>
          </div>
        </div>
      </section>

      {/* Where We Are Today */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-gold" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Where We Are Today</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We're currently in beta, and we've chosen to start with what we know best — <strong className="text-foreground">Toronto Blue Jays tickets</strong>. Baseball season is the perfect proving ground for our platform: high volume, passionate fans, and a city that loves its team. Every game, every section, every seat — available with complete pricing transparency.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              But this is just the beginning. Our roadmap includes expanding to cover every major professional league in Canada — NHL, NBA, NFL, MLS, CFL, and WNBA — as well as concerts, comedy shows, theatre productions, and special events. Our goal is to become the go-to destination for any Canadian looking to attend a live event without the fee anxiety that comes with every other platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We're also building tools for sellers, including streamlined inventory management, flexible listing options, and a reseller program designed to be fair for both sides of the transaction. Great marketplaces are built on trust, and we're committed to creating an ecosystem where buyers and sellers both win.
            </p>
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold">Our Promise to You</h2>
            </div>
            <ul className="space-y-4">
              {[
                { title: "Transparent Pricing", desc: "The price on the listing is the price you pay. No surprises, no hidden line items at checkout. Ever." },
                { title: "Guaranteed Authentic Tickets", desc: "Every ticket on our platform is verified. If something goes wrong, you're covered by our buyer protection — full refund, no questions asked." },
                { title: "Canadian-First Approach", desc: "We're building this for you — Canadian fans who deserve a fairer deal. Our decisions are guided by what's best for the Canadian live event community." },
                { title: "Continuous Improvement", desc: "We're in beta because we believe in building alongside our users. Your feedback shapes what we build next. We're listening, and we're moving fast." },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                  </span>
                  <div>
                    <strong className="text-foreground">{item.title}:</strong>
                    <span className="text-muted-foreground ml-1">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience <span className="text-gradient">Fee-Free</span> Tickets?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Join the growing community of Canadians who refuse to overpay. Browse events, grab your tickets, and keep more money in your pocket.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/membership" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Become a Member
            </a>
            <a href="/teams/mlb/blue-jays" className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-card border border-border text-foreground font-semibold hover:border-primary/40 transition-colors">
              Browse Blue Jays Tickets
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
