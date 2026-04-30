import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/TrustBar";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import HowItWorks from "@/components/HowItWorks";
import FeaturesSection from "@/components/FeaturesSection";
import SellerSection from "@/components/SellerSection";
import SocialProof from "@/components/SocialProof";
import FinalCTA from "@/components/FinalCTA";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  useEffect(() => {
    document.title = "Seats.ca — Canada's No-Fee Ticket Platform";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Buy and sell sports tickets in Canada with zero service fees. Blue Jays, Raptors, Maple Leafs, and more — no hidden charges, just honest pricing.");
    } else {
      const tag = document.createElement("meta");
      tag.name = "description";
      tag.content = "Buy and sell sports tickets in Canada with zero service fees. Blue Jays, Raptors, Maple Leafs, and more — no hidden charges, just honest pricing.";
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustBar />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <FeaturesSection />
      <SellerSection />
      <SocialProof />
      <FinalCTA />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Index;
