import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Store, DollarSign, Eye, Zap, Shield, Users, CheckCircle } from "lucide-react";
import ResellerCsvUpload from "@/components/reseller/ResellerCsvUpload";
import ResellerMyTickets from "@/components/reseller/ResellerMyTickets";

const benefits = [
  { icon: DollarSign, title: "Zero Listing Fees", description: "List your tickets for free — we only take a small commission on completed sales." },
  { icon: Eye, title: "Maximum Exposure", description: "Your tickets appear alongside our featured inventory on every team page and the homepage." },
  { icon: Zap, title: "Instant Listings", description: "Upload your inventory and have tickets live within minutes of admin approval." },
  
  { icon: Users, title: "Growing Audience", description: "Tap into our rapidly growing base of Canadian sports, concert, and theatre fans." },
  { icon: CheckCircle, title: "Fast Approvals", description: "Our team reviews applications quickly so you can start selling as soon as possible." },
];

const ResellerDashboard = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [resellerStatus, setResellerStatus] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    phone: "",
    email: "",
    ticketCount: "",
  });

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase.from("resellers").select("status").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      if (!error && data && data.length > 0) {
        setResellerStatus(data[0].status);
      }
      setLoading(false);
    };
    checkStatus();
  }, [user]);

  const isApproved = resellerStatus === "live";

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.companyName.trim() || !form.email.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setApplying(true);

    // If user not logged in, redirect to auth
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

      {/* Hero */}
      <div className="pt-20">
        <div className="bg-gradient-to-b from-primary/10 to-transparent py-16">
          <div className="container mx-auto px-4 text-center">
            <Store className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Become a <span className="text-gradient">seats.ca Seller</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Join Canada's fastest-growing ticket marketplace. List your inventory, reach thousands of buyers, and grow your business with zero listing fees.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          {/* Benefits */}
          <div className="mb-16">
            <h2 className="font-display text-2xl font-bold text-center mb-10">
              Why sell on seats.ca?
            </h2>
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

          {/* Upload section for approved resellers */}
          {isApproved && (
            <div className="mb-16 max-w-4xl mx-auto space-y-10">
              <ResellerMyTickets />
              <ResellerCsvUpload />
            </div>
          )}

          {/* Application / Status */}
          {isLoading || loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : !isApproved ? (
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
                      <input
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="John"
                        required
                        maxLength={50}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Last Name *</label>
                      <input
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="Smith"
                        required
                        maxLength={50}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Company Name *</label>
                    <input
                      value={form.companyName}
                      onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      placeholder="Your ticket company"
                      required
                      maxLength={100}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="(416) 555-0123"
                        maxLength={20}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@company.com"
                        required
                        maxLength={100}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">How many tickets do you own?</label>
                    <input
                      type="number"
                      value={form.ticketCount}
                      onChange={(e) => setForm({ ...form, ticketCount: e.target.value })}
                      placeholder="e.g. 500"
                      min="1"
                      max="100000"
                      className={inputClass}
                    />
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
