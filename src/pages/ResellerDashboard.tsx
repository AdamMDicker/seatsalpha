import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Store, DollarSign, Eye, Zap, Users, CheckCircle, FileText, ShieldAlert, BarChart3, Ticket, CreditCard, Settings, ArrowRightLeft, Upload, Wallet } from "lucide-react";
import ResellerCsvUpload from "@/components/reseller/ResellerCsvUpload";
import ResellerMyTickets from "@/components/reseller/ResellerMyTickets";
import SellerBillingSetup from "@/components/reseller/SellerBillingSetup";
import SellerSignupFee from "@/components/reseller/SellerSignupFee";
import SellerSalesDashboard from "@/components/reseller/SellerSalesDashboard";
import SellerBillingTab from "@/components/reseller/SellerBillingTab";
import SellerTransfers from "@/components/reseller/SellerTransfers";
import { redirectToStripeCheckout } from "@/utils/redirectToStripeCheckout";

const benefits = [
  { icon: DollarSign, title: "Zero Listing Fees", description: "List your tickets for free — we only take a small commission on completed sales." },
  { icon: Eye, title: "Maximum Exposure", description: "Your tickets appear alongside our featured inventory on every team page and the homepage." },
  { icon: Zap, title: "Instant Listings", description: "Upload your inventory and have tickets live within minutes of admin approval." },
  { icon: Users, title: "Growing Audience", description: "Tap into our rapidly growing base of Canadian sports, concert, and theatre fans." },
  { icon: CheckCircle, title: "Fast Approvals", description: "Our team reviews applications quickly so you can start selling as soon as possible." },
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
  const [applying, setApplying] = useState(false);
  const [resellerStatus, setResellerStatus] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [signupFeePaid, setSignupFeePaid] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [connectAccountId, setConnectAccountId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [connectLoading, setConnectLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", companyName: "", phone: "", email: "", ticketCount: "",
  });

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
            .single();
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

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.companyName.trim() || !form.email.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setApplying(true);
    if (!user) {
      toast({ title: "Sign in required", description: "Please create an account first, then come back to apply." });
      setApplying(false);
      return;
    }
    const { error } = await supabase.from("resellers").insert({
      user_id: user.id,
      business_name: form.companyName.trim(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim(),
      ticket_count: form.ticketCount ? parseInt(form.ticketCount) : null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application submitted!", description: "Our team will review your application and get back to you." });
    }
    setApplying(false);
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

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
                Join Canada's fastest-growing ticket marketplace. List your inventory, reach thousands of buyers, and grow your business with zero listing fees.
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
              <h2 className="font-display text-2xl font-bold text-center mb-10">Why sell on seats.ca?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((b) => (
                  <div key={b.title} className="glass rounded-xl p-6 text-center hover:border-primary/30 transition-all">
                    <b.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-display font-semibold text-foreground mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.description}</p>
                  </div>
                ))}
              </div>
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
            <div id="apply" className="max-w-xl mx-auto">
              <div className="glass rounded-xl p-8">
                <h2 className="font-display text-2xl font-bold text-center mb-2">Apply to Become a Seller</h2>
                <p className="text-sm text-muted-foreground text-center mb-8">
                  {user ? "Fill out the form below and our team will review your application." : "Create an account first, then fill out the form below."}
                </p>
                <form onSubmit={handleApply} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">First Name *</label>
                      <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="John" required maxLength={50} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Last Name *</label>
                      <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Smith" required maxLength={50} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Company Name *</label>
                    <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Your ticket company" required maxLength={100} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(416) 555-0123" maxLength={20} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required maxLength={100} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">How many tickets do you own?</label>
                    <input type="number" value={form.ticketCount} onChange={(e) => setForm({ ...form, ticketCount: e.target.value })} placeholder="e.g. 500" min="1" max="100000" className={inputClass} />
                  </div>
                  {!user && (
                    <p className="text-xs text-gold text-center">
                      You'll need to <a href="/auth" className="underline hover:text-primary">create an account</a> before submitting your application.
                    </p>
                  )}
                  <Button variant="hero" className="w-full" size="lg" disabled={applying || !user}>
                    {applying ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResellerDashboard;
