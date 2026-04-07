import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Ticket, TrendingUp, Package } from "lucide-react";

interface Stats {
  totalRevenue: number;
  ticketsSold: number;
  activeListings: number;
  totalListings: number;
}

const SellerSalesDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalRevenue: 0, ticketsSold: 0, activeListings: 0, totalListings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      // Get ticket stats
      const { data: tickets } = await supabase
        .from("tickets")
        .select("id, price, quantity, quantity_sold, is_active")
        .eq("seller_id", user.id)
        .eq("is_reseller_ticket", true);

      if (tickets) {
        const activeListings = tickets.filter((t) => t.is_active).length;
        const totalListings = tickets.length;
        const ticketsSold = tickets.reduce((sum, t) => sum + t.quantity_sold, 0);
        const totalRevenue = tickets.reduce((sum, t) => sum + t.price * t.quantity_sold, 0);

        setStats({ totalRevenue, ticketsSold, activeListings, totalListings });
      }
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  if (loading) return <div className="text-center text-muted-foreground py-4">Loading stats...</div>;

  const statCards = [
    { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
    { label: "Tickets Sold", value: stats.ticketsSold.toString(), icon: TrendingUp, color: "text-primary" },
    { label: "Active Listings", value: stats.activeListings.toString(), icon: Ticket, color: "text-blue-500" },
    { label: "Total Listings", value: stats.totalListings.toString(), icon: Package, color: "text-muted-foreground" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-4">Sales Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="glass rounded-xl p-4 text-center">
            <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerSalesDashboard;
