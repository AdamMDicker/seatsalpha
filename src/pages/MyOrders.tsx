import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

type OrderItem = Tables<"order_items"> & {
  tickets: {
    section: string;
    row_name: string | null;
    events: { title: string; venue: string; event_date: string; city: string } | null;
  } | null;
};

type OrderWithItems = Tables<"orders"> & {
  order_items: OrderItem[];
};

const MyOrders = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, tickets(section, row_name, events(title, venue, event_date, city)))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as OrderWithItems[]) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth?redirect=/my-orders" replace />;

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "pending": return "secondary";
      default: return "destructive";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-display font-bold">My Orders</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-16 gap-4">
              <Package className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground text-lg">No orders yet</p>
              <Link to="/" className="text-primary hover:underline text-sm">
                Browse events →
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const firstItem = order.order_items[0];
              const event = firstItem?.tickets?.events;
              return (
                <Link key={order.id} to={`/notifications/${order.id}`} className="block">
                  <Card className="hover:border-primary/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">
                            {event?.title || "Order"}
                          </p>
                          {event && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>{format(new Date(event.event_date), "MMM d, yyyy · h:mm a")}</span>
                              <span className="mx-1">·</span>
                              <span>{event.venue}</span>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                            {order.order_items.map((item) => (
                              <span key={item.id} className="bg-secondary rounded px-2 py-0.5">
                                {item.tickets?.section}{item.tickets?.row_name ? ` · Row ${item.tickets.row_name}` : ""} × {item.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant={statusColor(order.status)}>{order.status}</Badge>
                          <p className="font-semibold text-foreground">${Number(order.total_amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </p>
                          {order.is_fee_waived && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Member</Badge>
                          )}
                        </div>
                      </div>
                      {(order.uber_added || order.hotel_added || order.flight_added) && (
                        <div className="flex gap-3 mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                          {order.uber_added && <span>🚗 Uber</span>}
                          {order.hotel_added && <span>🏨 Hotel</span>}
                          {order.flight_added && <span>✈️ Flight</span>}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
