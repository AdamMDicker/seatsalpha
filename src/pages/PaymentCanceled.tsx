import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PaymentCanceled = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-28 pb-20 flex items-center justify-center">
      <div className="glass rounded-2xl p-10 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
          <X className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Payment Canceled</h1>
        <p className="text-muted-foreground mb-6">Your payment was not processed. No charges were made.</p>
        <Link to="/">
          <Button variant="hero">Back to Home</Button>
        </Link>
      </div>
    </div>
    <Footer />
  </div>
);

export default PaymentCanceled;
