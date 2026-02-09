import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const AdminTickets = () => {
  const [tickets, setTickets] = useState<(Tables<"tickets"> & { events?: { title: string } | null })[]>([]);
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ event_id: "", section: "", row_name: "", seat_number: "", price: "", quantity: "1" });
  const { toast } = useToast();

  const fetchData = async () => {
    const [ticketsRes, eventsRes] = await Promise.all([
      supabase.from("tickets").select("*, events(title)").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("event_date"),
    ]);
    setTickets(ticketsRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.event_id || !form.section || !form.price) {
      toast({ title: "Error", description: "Fill required fields", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("tickets").insert({
      event_id: form.event_id,
      section: form.section,
      row_name: form.row_name || null,
      seat_number: form.seat_number || null,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ticket added!" });
    setShowForm(false);
    setForm({ event_id: "", section: "", row_name: "", seat_number: "", price: "", quantity: "1" });
    fetchData();
  };

  const toggleActive = async (ticket: Tables<"tickets">) => {
    await supabase.from("tickets").update({ is_active: !ticket.is_active }).eq("id", ticket.id);
    fetchData();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-semibold">Tickets ({tickets.length})</h2>
        <Button variant="hero" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Ticket
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.event_id} onChange={(e) => setForm({ ...form, event_id: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
              <option value="">Select Event *</option>
              {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <input placeholder="Section *" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input placeholder="Row" value={form.row_name} onChange={(e) => setForm({ ...form, row_name: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input placeholder="Seat #" value={form.seat_number} onChange={(e) => setForm({ ...form, seat_number: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input type="number" placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={handleSave}>Save</Button>
            <Button variant="glass" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tickets.map((ticket) => (
          <div key={ticket.id} className={`glass rounded-xl p-4 flex items-center justify-between ${!ticket.is_active ? "opacity-50" : ""}`}>
            <div>
              <h3 className="font-semibold text-foreground">{ticket.events?.title || "Unknown Event"}</h3>
              <p className="text-sm text-muted-foreground">
                {ticket.section} {ticket.row_name && `· Row ${ticket.row_name}`} {ticket.seat_number && `· Seat ${ticket.seat_number}`} · ${ticket.price} · {ticket.quantity - ticket.quantity_sold} remaining
                {ticket.is_reseller_ticket && <span className="ml-2 text-gold">(Reseller)</span>}
              </p>
            </div>
            <Button variant="glass" size="sm" onClick={() => toggleActive(ticket)}>
              {ticket.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        ))}
        {tickets.length === 0 && <p className="text-muted-foreground text-center py-8">No tickets. Add them manually or via CSV import.</p>}
      </div>
    </div>
  );
};

export default AdminTickets;
