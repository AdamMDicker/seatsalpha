import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Store, Plus, Package, AlertCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const ResellerDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reseller, setReseller] = useState<Tables<"resellers"> | null>(null);
  const [tickets, setTickets] = useState<(Tables<"tickets"> & { events?: { title: string } | null })[]>([]);
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ event_id: "", section: "", row_name: "", seat_number: "", price: "", quantity: "1" });

  useEffect(() => {
    if (!isLoading && !user) navigate("/auth");
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Check reseller status
      const { data: resellerData } = await supabase
        .from("resellers")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setReseller(resellerData);

      if (resellerData?.is_enabled) {
        // Fetch their tickets and events
        const [ticketsRes, eventsRes] = await Promise.all([
          supabase.from("tickets").select("*, events(title)").eq("seller_id", user.id).order("created_at", { ascending: false }),
          supabase.from("events").select("*").order("event_date"),
        ]);
        setTickets(ticketsRes.data || []);
        setEvents(eventsRes.data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleApply = async () => {
    if (!businessName.trim() || !user) return;
    setApplying(true);
    const { error } = await supabase.from("resellers").insert({
      user_id: user.id,
      business_name: businessName.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application submitted!", description: "An admin will review and enable your account." });
      // Reload
      const { data } = await supabase.from("resellers").select("*").eq("user_id", user.id).maybeSingle();
      setReseller(data);
    }
    setApplying(false);
  };

  const handleAddTicket = async () => {
    if (!form.event_id || !form.section || !form.price || !user) {
      toast({ title: "Error", description: "Fill in all required fields.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("tickets").insert({
      event_id: form.event_id,
      section: form.section,
      row_name: form.row_name || null,
      seat_number: form.seat_number || null,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      is_reseller_ticket: true,
      seller_id: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Ticket listed!" });
    setShowForm(false);
    setForm({ event_id: "", section: "", row_name: "", seat_number: "", price: "", quantity: "1" });
    // Refresh
    const { data } = await supabase.from("tickets").select("*, events(title)").eq("seller_id", user.id).order("created_at", { ascending: false });
    setTickets(data || []);
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <Store className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Reseller Dashboard</h1>
        </div>

        {/* Not yet applied */}
        {!reseller && (
          <div className="glass rounded-xl p-8 max-w-lg mx-auto text-center space-y-4">
            <Store className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-display text-xl font-semibold">Become a Reseller</h2>
            <p className="text-sm text-muted-foreground">
              Apply to list your ticket inventory on seats.ca. Once approved by an admin, your tickets will appear on our platform.
            </p>
            <div>
              <input
                placeholder="Your business name *"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm mb-3"
                maxLength={100}
              />
              <Button variant="hero" onClick={handleApply} disabled={applying || !businessName.trim()}>
                {applying ? "Submitting..." : "Apply as Reseller"}
              </Button>
            </div>
          </div>
        )}

        {/* Applied but not enabled */}
        {reseller && !reseller.is_enabled && (
          <div className="glass rounded-xl p-8 max-w-lg mx-auto text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-gold mx-auto" />
            <h2 className="font-display text-xl font-semibold">Pending Approval</h2>
            <p className="text-sm text-muted-foreground">
              Your reseller application for <strong>{reseller.business_name}</strong> is under review. An admin will enable your account soon.
            </p>
          </div>
        )}

        {/* Enabled reseller */}
        {reseller?.is_enabled && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-lg font-semibold">{reseller.business_name}</h2>
                <p className="text-sm text-muted-foreground">Your listed tickets ({tickets.length})</p>
              </div>
              <Button variant="hero" size="sm" onClick={() => setShowForm(!showForm)}>
                <Plus className="h-4 w-4" /> Add Ticket
              </Button>
            </div>

            {showForm && (
              <div className="glass rounded-xl p-6 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={form.event_id}
                    onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                    className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                  >
                    <option value="">Select Event *</option>
                    {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                  </select>
                  <input placeholder="Section *" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" maxLength={20} />
                  <input placeholder="Row" value={form.row_name} onChange={(e) => setForm({ ...form, row_name: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" maxLength={20} />
                  <input placeholder="Seat #" value={form.seat_number} onChange={(e) => setForm({ ...form, seat_number: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" maxLength={20} />
                  <input type="number" placeholder="Price *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" min="1" max="10000" />
                  <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" min="1" max="100" />
                </div>
                <div className="flex gap-2">
                  <Button variant="hero" size="sm" onClick={handleAddTicket}>Save</Button>
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
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${ticket.is_active ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {ticket.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="glass rounded-xl p-8 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tickets listed yet. Click "Add Ticket" to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ResellerDashboard;
