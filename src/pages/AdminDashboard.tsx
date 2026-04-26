import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminResellers from "@/components/admin/AdminResellers";
import AdminCustomers from "@/components/admin/AdminCustomers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminCsvImport from "@/components/admin/AdminCsvImport";
import AdminResellerImport from "@/components/admin/AdminResellerImport";
import AdminBannedUsers from "@/components/admin/AdminBannedUsers";
import AdminLeagueVisibility from "@/components/admin/AdminLeagueVisibility";
import AdminHeroImage from "@/components/admin/AdminHeroImage";
import AdminNewsletter from "@/components/admin/AdminNewsletter";
import AdminEmailMonitor from "@/components/admin/AdminEmailMonitor";
import AdminSellerCodes from "@/components/admin/AdminSellerCodes";
import AdminTransfers from "@/components/admin/AdminTransfers";
import AdminReplayWebhook from "@/components/admin/AdminReplayWebhook";
import AdminWebhookEvents from "@/components/admin/AdminWebhookEvents";
import AdminSectionViews from "@/components/admin/AdminSectionViews";
import AdminE2ETest from "@/components/admin/AdminE2ETest";
import AdminInventoryHealth from "@/components/admin/AdminInventoryHealth";
import AdminTransferStatus from "@/components/admin/AdminTransferStatus";
import { LayoutDashboard, Calendar, Ticket, Users, UserCheck, ShoppingCart, Upload, Ban, Eye, Image, Mail, Activity, FileUp, Tag, ArrowRightLeft, RefreshCw, Webhook, Sparkles, PlayCircle, HeartPulse, ListChecks } from "lucide-react";
import { toast } from "sonner";

const tabs = [
  { id: "e2e", label: "E2E Test", icon: PlayCircle },
  { id: "events", label: "Events", icon: Calendar },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "inventory-health", label: "Inventory Health", icon: HeartPulse },
  { id: "import", label: "CSV Import", icon: Upload },
  { id: "reseller-import", label: "Reseller Import", icon: FileUp },
  { id: "resellers", label: "Resellers", icon: Users },
  { id: "seller-codes", label: "Seller Codes", icon: Tag },
  { id: "customers", label: "Customers", icon: UserCheck },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { id: "transfer-status", label: "Transfer Status", icon: ListChecks },
  { id: "banned", label: "Banned", icon: Ban },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "hero", label: "Hero Image", icon: Image },
  { id: "section-views", label: "AI Seat Views", icon: Sparkles },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "emails", label: "Email Monitor", icon: Activity },
  { id: "webhooks", label: "Webhook Log", icon: Webhook },
  { id: "replay", label: "Replay Webhook", icon: RefreshCw },
];

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("transfers");
  const [serverVerified, setServerVerified] = useState(false);
  const [transferCounts, setTransferCounts] = useState<{ pending: number; disputed: number }>({ pending: 0, disputed: 0 });

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Auto-open E2E tab when returning from Stripe Checkout (?e2e=success|canceled)
  useEffect(() => {
    const e2eParam = searchParams.get("e2e");
    if (e2eParam === "success" || e2eParam === "canceled") {
      setActiveTab("e2e");
      if (e2eParam === "success") {
        toast.success("Payment complete — showing E2E test results");
      } else {
        toast.info("Checkout canceled — E2E test paused");
      }
      // Clean the URL so a refresh doesn't re-trigger the toast
      const next = new URLSearchParams(searchParams);
      next.delete("e2e");
      setSearchParams(next, { replace: true });
      requestAnimationFrame(() => {
        const el = document.getElementById("admin-e2e-panel");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [searchParams, setSearchParams]);

  // Server-side admin verification via RPC
  useEffect(() => {
    const verify = async () => {
      if (!user) return;
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!data) { navigate("/"); return; }
      setServerVerified(true);
    };
    if (user && isAdmin) verify();
  }, [user, isAdmin, navigate]);

  // Fetch transfer counts for badge
  useEffect(() => {
    if (!serverVerified) return;
    const fetchCounts = async () => {
      const [{ count: pending }, { count: disputed }] = await Promise.all([
        supabase.from("order_transfers").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("order_transfers").select("*", { count: "exact", head: true }).eq("status", "disputed"),
      ]);
      setTransferCounts({ pending: pending || 0, disputed: disputed || 0 });
    };
    fetchCounts();
  }, [serverVerified]);

  if (isLoading || (!serverVerified && isAdmin)) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin || !serverVerified) return null;

  const transferBadgeCount = transferCounts.pending + transferCounts.disputed;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 pb-20">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
          </div>

          <Button
            type="button"
            variant="hero"
            onClick={() => setActiveTab("e2e")}
          >
            <PlayCircle className="h-4 w-4" />
            Open E2E Test
          </Button>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "transfers" && transferBadgeCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                  {transferBadgeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "events" && <AdminEvents />}
        {activeTab === "tickets" && <AdminTickets />}
        {activeTab === "inventory-health" && <AdminInventoryHealth />}
        {activeTab === "import" && <AdminCsvImport />}
        {activeTab === "reseller-import" && <AdminResellerImport />}
        {activeTab === "resellers" && <AdminResellers />}
        {activeTab === "seller-codes" && <AdminSellerCodes />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "transfers" && <AdminTransfers />}
        {activeTab === "banned" && <AdminBannedUsers />}
        {activeTab === "visibility" && <AdminLeagueVisibility />}
        {activeTab === "hero" && <AdminHeroImage />}
        {activeTab === "section-views" && <AdminSectionViews />}
        {activeTab === "newsletter" && <AdminNewsletter />}
        {activeTab === "emails" && <AdminEmailMonitor />}
        {activeTab === "webhooks" && <AdminWebhookEvents />}
        {activeTab === "replay" && <AdminReplayWebhook />}
        {activeTab === "e2e" && (
          <div id="admin-e2e-panel">
            <AdminE2ETest />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
