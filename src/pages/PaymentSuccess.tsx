import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Car, ExternalLink, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { getUberDeepLink } from "@/utils/uberDeepLink";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const venue = searchParams.get("venue");
  const eventTitle = searchParams.get("event");
  const uberLink = venue ? getUberDeepLink(venue) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-20 flex items-center justify-center px-4">
        <div className="glass rounded-2xl p-10 text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Payment Successful!</h1>
            {eventTitle && (
              <p className="text-primary font-display font-semibold mt-2">{decodeURIComponent(eventTitle)}</p>
            )}
            <p className="text-muted-foreground mt-2">Your tickets have been confirmed. Check your email for details.</p>
          </div>

          {uberLink && (
            <div className="glass rounded-xl p-6 space-y-3 border-primary/20">
              <div className="flex items-center justify-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h2 className="font-display font-semibold text-foreground">Need a ride to the game?</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Skip parking and get dropped off right at {venue}. Book your Uber now or save the link for game day.
              </p>
              <a href={uberLink} target="_blank" rel="noopener noreferrer">
                <Button variant="hero" className="w-full gap-2">
                  <Car className="h-4 w-4" />
                  Order Uber to {venue}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          )}

          {!uberLink && venue && (
            <div className="glass rounded-xl p-6 space-y-2 border-border">
              <div className="flex items-center justify-center gap-2">
                <Car className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-display font-semibold text-foreground">Getting to {venue}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Plan your trip ahead of time — consider rideshare, transit, or carpooling for a stress-free game day.
              </p>
            </div>
          )}

          <Link to="/">
            <Button variant="outline" className="w-full mt-2 gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
