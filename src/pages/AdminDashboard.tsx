import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
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
import { LayoutDashboard, Calendar, Ticket, Users, UserCheck, ShoppingCart, Upload, Ban, Eye, Image, Mail, Activity, FileUp } from "lucide-react";

const tabs = [
  { id: "events", label: "Events", icon: Calendar },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "import", label: "CSV Import", icon: Upload },
  { id: "reseller-import", label: "Reseller Import", icon: FileUp },
  { id: "resellers", label: "Resellers", icon: Users },
  { id: "customers", label: "Customers", icon: UserCheck },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "banned", label: "Banned", icon: Ban },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "hero", label: "Hero Image", icon: Image },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "emails", label: "Email Monitor", icon: Activity },
];

const AdminDashboard = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [serverVerified, setServerVerified] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, isLoading, navigate]);

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

  if (isLoading || (!serverVerified && isAdmin)) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!isAdmin || !serverVerified) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((tab) => (
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

        {activeTab === "events" && <AdminEvents />}
        {activeTab === "tickets" && <AdminTickets />}
        {activeTab === "import" && <AdminCsvImport />}
        {activeTab === "reseller-import" && <AdminResellerImport />}
        {activeTab === "resellers" && <AdminResellers />}
        {activeTab === "customers" && <AdminCustomers />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "banned" && <AdminBannedUsers />}
        {activeTab === "visibility" && <AdminLeagueVisibility />}
        {activeTab === "hero" && <AdminHeroImage />}
        {activeTab === "newsletter" && <AdminNewsletter />}
        {activeTab === "emails" && <AdminEmailMonitor />}
      </div>
    </div>
  );
};

export default AdminDashboard;
