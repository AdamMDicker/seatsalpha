import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Ticket, ChevronDown, ChevronUp } from "lucide-react";

interface SellerTicket {
  id: string;
  section: string;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_active: boolean;
  events: { title: string; venue: string; city: string; event_date: string } | null;
}

const ResellerMyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SellerTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchMyTickets = async () => {
      const { data } = await supabase
        .from("tickets")
        .select("id, section, row_name, seat_number, price, quantity, quantity_sold, is_active, events(title, venue, city, event_date)")
        .eq("seller_id", user.id)
        .eq("is_reseller_ticket", true)
        .order("created_at", { ascending: false });
      setTickets((data as SellerTicket[]) || []);
      setLoading(false);
    };
    fetchMyTickets();
  }, [user]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading your tickets...</p>;
  if (tickets.length === 0) return <p className="text-sm text-muted-foreground">You don't have any tickets listed yet. Use the CSV upload above to add your inventory.</p>;

  // Group by event
  const grouped = tickets.reduce((acc, t) => {
    const key = t.events?.title || "Unknown Event";
    if (!acc[key]) acc[key] = { event: t.events, tickets: [] };
    acc[key].tickets.push(t);
    return acc;
  }, {} as Record<string, { event: SellerTicket["events"]; tickets: SellerTicket[] }>);

  const totalActive = tickets.filter((t) => t.is_active).length;
  const totalRemaining = tickets.reduce((sum, t) => sum + (t.quantity - t.quantity_sold), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">My Tickets</h3>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{totalActive} active listings</span>
          <span>{totalRemaining} tickets remaining</span>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([eventTitle, { event, tickets: eventTickets }]) => {
          const isExpanded = expandedEvent === eventTitle;
          const remaining = eventTickets.reduce((s, t) => s + (t.quantity - t.quantity_sold), 0);

          return (
            <div key={eventTitle} className="bg-card border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedEvent(isExpanded ? null : eventTitle)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
              >
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">{eventTitle}</h4>
                  <p className="text-sm text-muted-foreground">
                    {event?.venue}, {event?.city} · {event?.event_date ? new Date(event.event_date).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{eventTickets.length} listing{eventTickets.length !== 1 ? "s" : ""} · {remaining} remaining</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border bg-secondary/20 px-5 py-3 space-y-1.5">
                  {eventTickets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-background/50">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-foreground">Sec {t.section}</span>
                        {t.row_name && <span className="text-muted-foreground">Row {t.row_name}</span>}
                        {t.seat_number && <span className="text-muted-foreground">Seats {t.seat_number}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-foreground">${t.price}</span>
                        <span className="text-muted-foreground">{t.quantity - t.quantity_sold}/{t.quantity} remaining</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          t.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"
                        }`}>
                          {t.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResellerMyTickets;
