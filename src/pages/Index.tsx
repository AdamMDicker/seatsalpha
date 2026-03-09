import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import EventsSection from "@/components/EventsSection";
import FeaturesSection from "@/components/FeaturesSection";
import MembershipSection from "@/components/MembershipSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <EventsSection />
      <MembershipSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default Index;
