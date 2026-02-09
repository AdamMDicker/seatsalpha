import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Tables<"orders">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">Orders ({orders.length})</h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-muted-foreground">
                  ${order.total_amount} · {order.status}
                  {order.is_fee_waived && <span className="text-success ml-2">· Member (no fees)</span>}
                  {order.buyer_city && <span className="ml-2">· From: {order.buyer_city}, {order.buyer_province}</span>}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {order.uber_added && <span className="text-primary">🚗 Uber</span>}
                  {order.hotel_added && <span className="text-primary">🏨 Hotel</span>}
                  {order.flight_added && <span className="text-primary">✈️ Flight</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders yet.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
