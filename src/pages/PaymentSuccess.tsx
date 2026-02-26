import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentSuccess = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 pb-20 flex items-center justify-center">
      <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">Your tickets have been confirmed. Check your email for details.</p>
        <Link to="/">
          <Button variant="hero">Back to Home</Button>
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default PaymentSuccess;
