import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Calendar, ShoppingBag, AlertTriangle, CreditCard, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { useResellerAccount } from "@/hooks/useResellerAccount";
import FulfillmentIssueBanner from "@/components/FulfillmentIssueBanner";
import DeliveryStatusInfo, { type TransferStatusRow } from "@/components/DeliveryStatusInfo";

const STUCK_AFTER_MS = 5 * 60 * 1000; // 5 minutes

function isStuck(order: { status: string; created_at: string }): boolean {
  if (order.status === "completed") return false;
  const ageMs = Date.now() - new Date(order.created_at).getTime();
  return ageMs > STUCK_AFTER_MS;
}

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
  const { hasResellerAccount, isLoading: resellerLoading } = useResellerAccount();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [transfersByOrder, setTransfersByOrder] = useState<Record<string, TransferStatusRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, tickets(section, row_name, events(title, venue, event_date, city)))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const list = (data as OrderWithItems[]) || [];
      setOrders(list);

      if (list.length > 0) {
        const { data: transfers } = await supabase
          .from("order_transfers")
          .select("order_id, status, uploaded_at, confirmed_at, forward_sent_at, created_at")
          .in("order_id", list.map((o) => o.id));
        const grouped: Record<string, TransferStatusRow[]> = {};
        (transfers || []).forEach((t: any) => {
          (grouped[t.order_id] ||= []).push(t);
        });
        setTransfersByOrder(grouped);
      }

      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth?redirect=/my-orders" replace />;
  if (resellerLoading) return null;
  if (hasResellerAccount && !loading && orders.length === 0) {
    return <Navigate to="/reseller" replace />;
  }

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
            {/* Top-of-page banner if any order is stuck (>5min, not completed) */}
            {orders.some(isStuck) && (
              <FulfillmentIssueBanner variant="pending" />
            )}

            {/* Help / explainer card */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-start gap-3">
                <HelpCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-foreground/80 leading-relaxed">
                  <p className="font-semibold text-foreground mb-1">Two things happen after you order:</p>
                  <p>
                    <span className="font-medium text-foreground">1. Payment</span> is confirmed instantly when your card is charged.{" "}
                    <span className="font-medium text-foreground">2. Ticket delivery</span> happens separately — your seller transfers the seats through Ticketmaster, which is typically completed within a few hours and up to 24 hours before the event.
                  </p>
                </div>
              </CardContent>
            </Card>

            {orders.map((order) => {
              const firstItem = order.order_items[0];
              const event = firstItem?.tickets?.events;
              const stuck = isStuck(order);
              const transfers = transfersByOrder[order.id] || [];
              const paymentLabel =
                order.status === "completed"
                  ? "Paid"
                  : order.status === "pending"
                  ? "Processing payment"
                  : order.status;
              return (
                <Link key={order.id} to={`/notifications/${order.id}`} className="block">
                  <Card className={`transition-colors ${stuck ? "border-destructive/50 hover:border-destructive" : "hover:border-primary/40"}`}>
                    <CardContent className="p-5 space-y-4">
                      {/* Top row: event + amount */}
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
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <p className="font-semibold text-foreground">${Number(order.total_amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </p>
                          {order.is_fee_waived && (
                            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">Member</Badge>
                          )}
                        </div>
                      </div>

                      {/* Payment status pill */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : order.status === "pending"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {paymentLabel}
                        </span>
                      </div>

                      {/* Delivery status — separate track */}
                      <DeliveryStatusInfo
                        orderStatus={order.status}
                        orderCreatedAt={order.created_at}
                        transfers={transfers}
                      />

                      {(order.uber_added || order.hotel_added || order.flight_added) && (
                        <div className="flex gap-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
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
