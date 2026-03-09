import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Car, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { getUberDeepLink } from "@/utils/uberDeepLink";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const venue = searchParams.get("venue");
  const uberLink = venue ? getUberDeepLink(venue) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 flex items-center justify-center">
        <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="font-display text-2xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">Your tickets have been confirmed. Check your email for details.</p>

          {uberLink && (
            <a href={uberLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2">
                <Car className="h-4 w-4" />
                Get an Uber to the Game
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          )}

          <Link to="/">
            <Button variant="hero" className="w-full mt-2">Back to Home</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
