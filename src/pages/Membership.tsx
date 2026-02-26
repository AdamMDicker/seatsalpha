import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Crown, Check, Zap, X, ArrowRight, HelpCircle, Settings } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const competitorFees = [
  { platform: "Ticketmaster", fee: "Service Fee", percent: "20–30%", example: "$30–$45 on a $150 ticket" },
  { platform: "Ticketmaster", fee: "Order Processing Fee", percent: "Flat", example: "$5.50 per order" },
  { platform: "Ticketmaster", fee: "Facility Charge", percent: "Varies", example: "$3–$5 per ticket" },
  { platform: "StubHub", fee: "Service Fee", percent: "~25–30%", example: "$37–$45 on a $150 ticket" },
  { platform: "StubHub", fee: "Fulfillment Fee", percent: "Flat", example: "$5–$10 per order" },
  { platform: "Vivid Seats", fee: "Service Fee", percent: "~20–30%", example: "$30–$45 on a $150 ticket" },
];

const memberBenefits = [
  "Zero service fees on every ticket purchase for a full year",
  "Early access to presale events before the general public",
  "Exclusive member-only pricing on select events",
  "Priority customer support — skip the queue",
  "Free cancellation on eligible events",
  "Bundle savings on travel and ride packages",
];

const savingsExamples = [
  { event: "Blue Jays Game (2 tickets)", sport: "⚾", sportLabel: "MLB", faceValue: 150, competitorFees: 42, saved: 42 },
  { event: "Raptors Courtside (2 tickets)", sport: "🏀", sportLabel: "NBA", faceValue: 400, competitorFees: 108, saved: 108 },
  { event: "Drake Concert (2 tickets)", sport: "🎵", sportLabel: "Concert", faceValue: 300, competitorFees: 82, saved: 82 },
  { event: "Leafs Playoffs (2 tickets)", sport: "🏒", sportLabel: "NHL", faceValue: 500, competitorFees: 135, saved: 135 },
];

const faqs = [
  { q: "What is included with my seats.ca membership?", a: "Your $19.95/year membership eliminates all service fees, processing fees, and facility charges on every ticket you buy through seats.ca. You also get early access to presales, exclusive member pricing, and priority support." },
  { q: "How much will I actually save?", a: "The average Canadian fan pays $300+ per year in hidden ticketing fees. Most members save 10–20x their membership cost in the first year alone." },
  { q: "Are there any hidden fees at checkout?", a: "Absolutely not. With a seats.ca membership, the price you see is the price you pay. No service fees, no processing fees, no facility charges." },
  { q: "Don't other sites just build fees into the ticket price?", a: "Yes — many platforms advertise 'no fees' but simply inflate the ticket's listed price. At seats.ca, our prices reflect the actual ticket value." },
  { q: "Can I cancel my membership?", a: "Yes. You can cancel anytime. Your membership benefits remain active until the end of your billing period." },
  { q: "Do I need a membership to buy tickets?", a: "No. Anyone can browse and purchase tickets. However, non-members will pay standard service fees at checkout." },
  { q: "Are the tickets guaranteed authentic?", a: "100%. Every ticket sold on seats.ca is backed by our authenticity guarantee." },
  { q: "What types of events can I buy tickets for?", a: "We cover all major sports leagues (NHL, NBA, MLB, NFL, MLS, CFL), plus concerts, comedy shows, theatre, and more." },
];

const platformLogos: Record<string, string> = { Ticketmaster: "TM", StubHub: "SH", "Vivid Seats": "VS" };
const platformColors: Record<string, string> = { Ticketmaster: "bg-blue-600", StubHub: "bg-purple-600", "Vivid Seats": "bg-orange-600" };

const Membership = () => {
  const totalSaved = savingsExamples.reduce((sum, e) => sum + e.saved, 0);
  const { user, isMember, membershipEnd, checkMembership } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Welcome to seats.ca!", description: "Your membership is now active." });
      checkMembership();
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Membership not purchased", description: "You can join anytime.", variant: "destructive" });
    }
  }, [searchParams]);

  const handleJoin = async () => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not start checkout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Could not open portal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const JoinButton = ({ className = "" }: { className?: string }) =>
    isMember ? (
      <div className={`space-y-2 ${className}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/15 border border-success/30">
          <Check className="h-4 w-4 text-success" />
          <span className="text-sm font-semibold text-success">Active Member</span>
          {membershipEnd && <span className="text-xs text-muted-foreground">until {new Date(membershipEnd).toLocaleDateString()}</span>}
        </div>
        <Button variant="outline" size="sm" onClick={handleManage} disabled={loading} className="ml-2">
          <Settings className="h-4 w-4 mr-1" /> Manage
        </Button>
      </div>
    ) : (
      <Button variant="gold" size="lg" onClick={handleJoin} disabled={loading} className={className}>
        <Zap className="h-5 w-5" />
        {loading ? "Loading..." : "Join for $19.95/year"}
      </Button>
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/30 mb-6">
            <Crown className="h-5 w-5 text-gold" />
            <span className="text-sm font-semibold text-gold">seats.ca Membership</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Stop Paying <span className="text-gold">Ridiculous Fees</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            For just <strong className="text-foreground">$19.95/year</strong>, eliminate every service fee on your ticket purchases.
          </p>
          <JoinButton />
        </div>
      </section>

      {/* Competitor fees table */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
            The Fees They <span className="text-destructive">Don't</span> Want You to Notice
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10">
            Every major ticketing platform adds layers of hidden fees at checkout.
          </p>
          <div className="max-w-3xl mx-auto glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-2 p-4 border-b border-border text-sm font-semibold text-muted-foreground">
              <span>Platform</span><span>Fee Type</span><span>Rate</span><span>On a $150 Ticket</span>
            </div>
            {competitorFees.map((fee, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 p-4 border-b border-border/50 text-sm items-center">
                <span className="font-medium text-foreground flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-[10px] font-bold text-white ${platformColors[fee.platform]}`}>{platformLogos[fee.platform]}</span>
                  {fee.platform}
                </span>
                <span className="text-muted-foreground">{fee.fee}</span>
                <span className="text-destructive font-semibold">{fee.percent}</span>
                <span className="text-destructive">{fee.example}</span>
              </div>
            ))}
            <div className="grid grid-cols-4 gap-2 p-4 bg-primary/5 items-center">
              <span className="font-bold text-primary">seats.ca Member</span>
              <span className="text-muted-foreground">All Fees</span>
              <span className="font-bold text-primary">0%</span>
              <span className="font-bold text-primary flex items-center gap-1">$0.00 <Check className="h-4 w-4" /></span>
            </div>
          </div>
          <div className="max-w-3xl mx-auto mt-6 glass rounded-xl p-5 border-l-4 border-gold">
            <p className="text-sm text-foreground/90">
              <strong className="text-gold">⚠️ Watch out for "no-fee" claims.</strong>{" "}
              Some platforms advertise no service fees but simply bake the cost into the ticket price.
            </p>
          </div>
        </div>
      </section>

      {/* Savings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-3">
            Real Savings, <span className="text-gold">Real Events</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-lg mx-auto mb-10">See how much a typical fan saves per year.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-8">
            {savingsExamples.map((item, i) => (
              <div key={i} className="glass rounded-xl overflow-hidden hover:border-gold/40 transition-all">
                <div className="bg-primary/10 border-b border-border px-4 py-2.5 flex items-center justify-center gap-2">
                  <span className="text-xl">{item.sport}</span>
                  <span className="text-sm font-bold text-primary tracking-wide">{item.sportLabel}</span>
                </div>
                <div className="p-5 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-2">{item.event}</p>
                  <p className="text-xs text-muted-foreground">Face value: ${item.faceValue}</p>
                  <div className="my-3 flex items-center justify-center gap-2">
                    <span className="text-destructive line-through text-sm">${item.competitorFees} fees</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-primary font-bold">$0</span>
                  </div>
                  <p className="text-gold font-bold text-lg">You save ${item.saved}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center glass rounded-2xl p-8 max-w-md mx-auto glow-gold">
            <p className="text-sm text-muted-foreground mb-1">Total annual savings on just 4 events</p>
            <p className="font-display text-5xl font-bold text-gold">${totalSaved}</p>
            <p className="text-sm text-muted-foreground mt-2">Membership cost: <strong className="text-foreground">$19.95</strong></p>
            <p className="text-primary font-semibold mt-1">That's a {Math.round(totalSaved / 19.95)}x return</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto glass rounded-2xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <h2 className="font-display text-3xl font-bold">Everything You Get for <span className="text-gold">$19.95/year</span></h2>
                <ul className="space-y-4">
                  {memberBenefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-gold mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
                <JoinButton className="w-full sm:w-auto" />
              </div>
              <div className="flex-shrink-0">
                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex flex-col items-center justify-center glow-gold">
                  <span className="font-display text-4xl font-bold text-gold">$19.95</span>
                  <span className="text-sm text-muted-foreground mt-1">per year</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-10">seats.ca vs <span className="text-muted-foreground">Everyone Else</span></h2>
          <div className="max-w-2xl mx-auto glass rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-border font-semibold text-sm">
              <span className="text-left text-muted-foreground">Feature</span>
              <span className="text-gold">seats.ca</span>
              <span className="text-muted-foreground">Others</span>
            </div>
            {[
              ["Service Fees", "None", "20–30%"],
              ["Processing Fees", "None", "$5–$10"],
              ["Facility Charges", "None", "$3–$5"],
              ["Hidden Checkout Fees", "Never", "Common"],
              ["Membership Cost", "$19.95/yr", "N/A"],
              ["Guaranteed Authentic", "Always", "Varies"],
              ["Travel Bundles", "Included", "Rare"],
            ].map(([feature, us, them], i) => (
              <div key={i} className="grid grid-cols-3 gap-2 p-4 border-b border-border/50 text-sm items-center">
                <span className="text-left text-foreground font-medium">{feature}</span>
                <span className="text-primary font-semibold flex items-center justify-center gap-1"><Check className="h-4 w-4" /> {us}</span>
                <span className="text-muted-foreground flex items-center justify-center gap-1"><X className="h-4 w-4 text-destructive/60" /> {them}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">FAQ</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="glass rounded-xl border border-border px-5">
                  <AccordionTrigger className="text-sm font-semibold text-foreground hover:text-primary text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to Stop Overpaying?</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">Join thousands of Canadians who refuse to pay unfair ticket fees.</p>
          <JoinButton />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Membership;
