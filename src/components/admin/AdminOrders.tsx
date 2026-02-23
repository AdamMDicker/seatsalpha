import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type OrderWithDetails = Tables<"orders"> & {
  profiles?: { full_name: string | null; city: string | null } | null;
  order_items: (Tables<"order_items"> & {
    tickets: { section: string; row_name: string | null; events: { title: string; city: string } | null } | null;
  })[];
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCity, setFilterCity] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      // Fetch orders with items + ticket details
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, order_items(*, tickets(section, row_name, events(title, city)))")
        .order("created_at", { ascending: false });

      if (!ordersData) { setLoading(false); return; }

      // Fetch profiles for each order
      const userIds = [...new Set(ordersData.map((o) => o.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, city")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      const enriched = ordersData.map((o) => ({
        ...o,
        profiles: profileMap.get(o.user_id) || null,
      })) as OrderWithDetails[];

      setOrders(enriched);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const statuses = [...new Set(orders.map((o) => o.status))];
  const cities = [...new Set(
    orders.flatMap((o) => o.order_items.map((i) => i.tickets?.events?.city).filter(Boolean))
  )] as string[];

  const filteredOrders = orders.filter((o) => {
    const customerName = o.profiles?.full_name || "";
    const eventTitles = o.order_items.map((i) => i.tickets?.events?.title || "").join(" ");
    const matchesSearch = !searchQuery ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eventTitles.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    const matchesCity = filterCity === "all" || o.order_items.some((i) => i.tickets?.events?.city === filterCity);
    return matchesSearch && matchesStatus && matchesCity;
  });

  const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const totalFees = filteredOrders.reduce((s, o) => s + Number(o.fees_amount), 0);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-xl font-semibold">Orders ({orders.length})</h2>
        <div className="flex gap-4 text-sm">
          <span className="text-muted-foreground">Revenue: <strong className="text-foreground">${totalRevenue.toFixed(0)}</strong></span>
          <span className="text-muted-foreground">Fees: <strong className="text-foreground">${totalFees.toFixed(0)}</strong></span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 mt-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search by customer, event, or order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="all">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="all">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div key={order.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-foreground">
                  {order.profiles?.full_name || "Unknown Customer"} · #{order.id.slice(0, 8)}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${Number(order.total_amount).toFixed(2)}
                  {Number(order.fees_amount) > 0 && ` (fees: $${Number(order.fees_amount).toFixed(2)})`}
                  {order.is_fee_waived && <span className="text-primary ml-2">Member — no fees</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === "completed" ? "default" : order.status === "pending" ? "secondary" : "destructive"}>
                  {order.status}
                </Badge>
                <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Order items */}
            {order.order_items.length > 0 && (
              <div className="space-y-1 border-t border-border/50 pt-2">
                {order.order_items.map((item) => (
                  <p key={item.id} className="text-xs text-muted-foreground">
                    {item.tickets?.events?.title || "Event"} — {item.tickets?.section}{item.tickets?.row_name ? `, Row ${item.tickets.row_name}` : ""} × {item.quantity} @ ${Number(item.unit_price).toFixed(2)}
                  </p>
                ))}
              </div>
            )}

            {/* Add-ons */}
            {(order.uber_added || order.hotel_added || order.flight_added) && (
              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                {order.uber_added && <span className="text-primary">🚗 Uber</span>}
                {order.hotel_added && <span className="text-primary">🏨 Hotel</span>}
                {order.flight_added && <span className="text-primary">✈️ Flight</span>}
              </div>
            )}
          </div>
        ))}
        {filteredOrders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders found.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
