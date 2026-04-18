import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Store, DollarSign, Eye, Zap, Users, CheckCircle, FileText, ShieldAlert, BarChart3, Ticket, CreditCard, Settings, ArrowRightLeft, Upload, Wallet, Mail } from "lucide-react";
import ResellerCsvUpload from "@/components/reseller/ResellerCsvUpload";
import ResellerMyTickets from "@/components/reseller/ResellerMyTickets";
import SellerApplicationForm from "@/components/reseller/SellerApplicationForm";
import SellerBillingSetup from "@/components/reseller/SellerBillingSetup";
import SellerSignupFee from "@/components/reseller/SellerSignupFee";
import SellerSalesDashboard from "@/components/reseller/SellerSalesDashboard";
import SellerBillingTab from "@/components/reseller/SellerBillingTab";
import SellerTransfers from "@/components/reseller/SellerTransfers";
import SellerPayoutSetup from "@/components/reseller/SellerPayoutSetup";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";

const benefits = [
  { icon: DollarSign, title: "Keep More Profit", description: "Low annual membership — no per-ticket commissions or hidden deductions." },
  { icon: Users, title: "Real Buyers, Not Browsers", description: "Higher intent shoppers = faster sales." },
  { icon: Eye, title: "Fair Marketplace", description: "No bots. No games. Just equal visibility." },
  { icon: Settings, title: "You Set the Price", description: "Full control, no forced discounts." },
  { icon: CheckCircle, title: "All-In Pricing Wins", description: "Transparent pricing builds trust and boosts conversions." },
  { icon: Zap, title: "More Exposure", description: "Reach both members and non-members." },
  { icon: Upload, title: "Bulk Listing Made Easy", description: "Upload multiple games at once with simple CSV tools — no manual entry." },
  { icon: Mail, title: "Email-Based Transfers", description: "Tickets transfer via email — not barcodes. Your account stays private, and buyers get reliable, trackable delivery." },
  { icon: CreditCard, title: "Simple, Low Cost", description: "Annual Membership fee* — affordable access to Canada's fastest-growing marketplace." },
];

const portalTabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { id: "listings", label: "My Tickets", icon: Ticket },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "payouts", label: "Payouts", icon: Wallet },
];

const ResellerDashboard = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [resellerStatus, setResellerStatus] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [signupFeePaid, setSignupFeePaid] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [connectAccountId, setConnectAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [connectLoading, setConnectLoading] = useState(false);

  useEffect(() => {
    const subParam = searchParams.get("subscription");
    const signupParam = searchParams.get("signup_fee");
    const connectParam = searchParams.get("connect");
    if (subParam === "success") {
      toast({ title: "Subscription Active!", description: "Your seller membership is now active." });
    }
    if (signupParam === "success") {
      toast({ title: "Sign-Up Fee Paid!", description: "Your $100 sign-up fee has been processed. Now set up your weekly membership." });
    }
    if (connectParam === "success") {
      toast({ title: "Payout Account Connected!", description: "Your payout account is being set up." });
    }
  }, [searchParams]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("resellers")
        .select("id, status, agreement_accepted_at, is_suspended, signup_fee_paid_at, stripe_connect_account_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setResellerStatus(data[0].status);
        setAgreementAccepted(!!data[0].agreement_accepted_at);
        setSignupFeePaid(!!(data[0] as any).signup_fee_paid_at);
        setIsSuspended(data[0].is_suspended);
        setConnectAccountId((data[0] as any).stripe_connect_account_id || null);

        // Check subscription status
        if (data[0].status === "live" && data[0].agreement_accepted_at) {
          const { data: subData } = await supabase
            .from("seller_subscriptions")
            .select("status")
            .eq("reseller_id", data[0].id)
            .maybeSingle();
          setSubscriptionStatus(subData?.status || null);
        }
      }
      setLoading(false);
    };
    checkStatus();
  }, [user, searchParams]);

  const isApproved = resellerStatus === "live";
  const hasActiveSubscription = subscriptionStatus === "active";
  const isFullyUnlocked = isApproved && agreementAccepted && signupFeePaid && hasActiveSubscription && !isSuspended;

  const handleSetupPayouts = async () => {
    setConnectLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-seller-connect-account");
      if (error) throw error;
      if (data?.url) {
        redirectToStripeCheckout(data.url);
      } else {
        throw new Error("No onboarding URL returned");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start payout setup", variant: "destructive" });
    } finally {
      setConnectLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-16">
          <div className="container mx-auto px-4 text-center">
            <Store className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              {isFullyUnlocked ? "Seller Portal" : "Become a "}
              {!isFullyUnlocked && <span className="text-gradient">seats.ca Seller</span>}
            </h1>
            {!isFullyUnlocked && (
              <p className="text-muted-foreground max-w-lg mx-auto">
                Join Canada's fastest-growing ticket marketplace. List your inventory, reach thousands of buyers, and grow your business with a simple annual membership.
              </p>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* Suspended Banner */}
          {isSuspended && (
            <div className="mb-8 max-w-xl mx-auto">
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center space-y-2">
                <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
                <h2 className="font-display text-xl font-bold text-destructive">Account Suspended</h2>
                <p className="text-sm text-muted-foreground">
                  Your seller account has been suspended. All your tickets have been delisted. 
                  Please contact support at support@seats.ca for more information.
                </p>
              </div>
            </div>
          )}

          {/* Payment Failed Banner */}
          {subscriptionStatus === "past_due" && !isSuspended && (
            <div className="mb-8 max-w-xl mx-auto">
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center space-y-2">
                <CreditCard className="h-10 w-10 text-destructive mx-auto" />
                <h2 className="font-display text-xl font-bold text-destructive">Payment Failed</h2>
                <p className="text-sm text-muted-foreground">
                  Your weekly membership payment failed. All your tickets have been delisted. 
                  Please update your payment method to restore your listings.
                </p>
                <SellerBillingSetup />
              </div>
            </div>
          )}

          {/* Benefits (show when not fully unlocked) */}
          {!isFullyUnlocked && !isSuspended && (
            <div className="mb-16">
              <h2 className="font-display text-2xl font-bold text-center mb-3">Why Sell on Seats.ca?</h2>
              <p className="text-muted-foreground text-center mb-10">Low annual membership fee* to start selling.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((b) => (
                  <div key={b.title} className="glass rounded-xl p-6 text-center hover:border-primary/30 transition-all">
                    <b.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">*Membership fee applies per sport listing category. See Seller Agreement for full details.</p>
            </div>
          )}

          {/* Gate: Agreement needed */}
          {isApproved && !agreementAccepted && !isSuspended && (
            <div className="mb-16 max-w-xl mx-auto">
              <div className="glass rounded-xl p-8 text-center space-y-4">
                <FileText className="h-10 w-10 text-primary mx-auto" />
                <h2 className="font-display text-xl font-bold">Seller Agreement Required</h2>
                <p className="text-sm text-muted-foreground">
                  Before you can list tickets, you must review and accept the Seats.ca Seller Agreement.
                </p>
                <Button variant="hero" size="lg" onClick={() => navigate("/seller-agreement")}>
                  Review & Accept Agreement
                </Button>
              </div>
            </div>
          )}

          {/* Gate: Signup fee needed */}
          {isApproved && agreementAccepted && !signupFeePaid && !isSuspended && (
            <SellerSignupFee />
          )}

          {/* Gate: Billing setup needed */}
          {isApproved && agreementAccepted && signupFeePaid && !hasActiveSubscription && !isSuspended && subscriptionStatus !== "past_due" && (
            <SellerBillingSetup />
          )}

          {/* Fully unlocked: Seller Portal */}
          {isFullyUnlocked && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Tab navigation */}
              <div className="flex gap-2 flex-wrap">
                {portalTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "dashboard" && <SellerSalesDashboard />}
              {activeTab === "transfers" && <SellerTransfers />}
              {activeTab === "listings" && <ResellerMyTickets />}
              {activeTab === "upload" && <ResellerCsvUpload />}
              {activeTab === "billing" && <SellerBillingTab />}
              {activeTab === "payouts" && (
                <div>
                  <h2 className="font-display text-xl font-bold mb-4">Payouts</h2>
                  <div className="glass rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-primary" />
                      <span className="font-semibold">Payout Account</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {connectAccountId
                        ? "Your payout account is connected. Payouts are processed 2 weeks after each event."
                        : "Set up your payout account to receive payments for ticket sales. Payouts are processed 2 weeks after each event."}
                    </p>
                    <Button
                      variant={connectAccountId ? "outline" : "hero"}
                      onClick={handleSetupPayouts}
                      disabled={connectLoading}
                    >
                      {connectLoading
                        ? "Redirecting..."
                        : connectAccountId
                          ? "Update Payout Account"
                          : "Set Up Payouts"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application form */}
          {(isLoading || loading) ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : !isApproved && !isSuspended ? (
            <SellerApplicationForm />
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResellerDashboard;
