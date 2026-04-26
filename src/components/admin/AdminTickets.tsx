import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Search, Camera, X, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Tables } from "@/integrations/supabase/types";
import { TEAMS_VENUES, LEAGUES_LIST } from "@/data/teamsVenues";
import {
  validateTicketQuantityUpdate,
  validateTicketPrice,
  validateTicketSection,
} from "@/utils/ticketValidation";

type TicketWithEvent = Tables<"tickets"> & { events?: { title: string; city: string; venue: string } | null };

const AdminTickets = () => {
  const [tickets, setTickets] = useState<TicketWithEvent[]>([]);
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ event_id: "", section: "", row_name: "", seat_number: "", price: "", quantity: "1" });
  const [editing, setEditing] = useState<TicketWithEvent | null>(null);
  const [editForm, setEditForm] = useState({ section: "", row_name: "", seat_number: "", price: "", quantity: "1" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeague, setFilterLeague] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [editError, setEditError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    const [ticketsRes, eventsRes] = await Promise.all([
      supabase.from("tickets").select("*, events(title, city, venue)").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("event_date"),
    ]);
    setTickets(ticketsRes.data || []);
    setEvents(eventsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    if (!form.event_id) {
      toast({ title: "Error", description: "Select an event", variant: "destructive" });
      return;
    }
    const sectionCheck = validateTicketSection(form.section);
    if (!sectionCheck.ok) {
      toast({ title: "Invalid section", description: sectionCheck.error, variant: "destructive" });
      return;
    }
    const priceCheck = validateTicketPrice(form.price);
    if (!priceCheck.ok) {
      toast({ title: "Invalid price", description: priceCheck.error, variant: "destructive" });
      return;
    }
    // New tickets have 0 sold, so no oversell risk yet — but still validate the integer range.
    const qtyCheck = validateTicketQuantityUpdate({
      rawQuantity: form.quantity,
      currentQuantitySold: 0,
    });
    if (!qtyCheck.ok) {
      toast({ title: "Invalid quantity", description: qtyCheck.error, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("tickets").insert({
      event_id: form.event_id,
      section: sectionCheck.section,
      row_name: form.row_name || null,
      seat_number: form.seat_number || null,
      price: priceCheck.price,
      quantity: qtyCheck.quantity,
      seller_id: "c0768913-3e54-476a-b4b2-8a0051b087ed",
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Ticket added!" });
    setShowForm(false);
    setForm({ event_id: "", section: "", row_name: "", seat_number: "", price: "", quantity: "1" });
    fetchData();
  };

  const openEdit = (ticket: TicketWithEvent) => {
    setEditing(ticket);
    setEditError(null);
    setEditForm({
      section: ticket.section, row_name: ticket.row_name || "",
      seat_number: ticket.seat_number || "", price: String(ticket.price),
      quantity: String(ticket.quantity),
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setEditError(null);

    const sectionCheck = validateTicketSection(editForm.section);
    if (!sectionCheck.ok) {
      setEditError(sectionCheck.error);
      return;
    }
    const priceCheck = validateTicketPrice(editForm.price);
    if (!priceCheck.ok) {
      setEditError(priceCheck.error);
      return;
    }
    const qtyCheck = validateTicketQuantityUpdate({
      rawQuantity: editForm.quantity,
      currentQuantitySold: editing.quantity_sold,
    });
    if (!qtyCheck.ok) {
      setEditError(qtyCheck.error);
      return;
    }

    const { error } = await supabase.from("tickets").update({
      section: sectionCheck.section,
      row_name: editForm.row_name || null,
      seat_number: editForm.seat_number || null,
      price: priceCheck.price,
      quantity: qtyCheck.quantity,
    }).eq("id", editing.id);
    if (error) {
      // Server-side oversell trigger or any other DB constraint
      setEditError(error.message);
      return;
    }
    toast({ title: "Ticket updated!" });
    setEditing(null);
    fetchData();
  };

  const toggleActive = async (ticket: Tables<"tickets">) => {
    await supabase.from("tickets").update({ is_active: !ticket.is_active }).eq("id", ticket.id);
    fetchData();
  };

  // Derive cities from tickets
  const cities = [...new Set(tickets.map((t) => t.events?.city).filter(Boolean))] as string[];

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = !searchQuery || (t.events?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || t.section.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === "all" || t.events?.city === filterCity;
    const matchesLeague = filterLeague === "all" || TEAMS_VENUES.some((tv) => tv.league === filterLeague && (t.events?.title || "").includes(tv.team));
    return matchesSearch && matchesCity && matchesLeague;
  });

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-semibold">Tickets ({tickets.length})</h2>
        <Button variant="hero" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" /> Add Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search by event or section..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
        </div>
        <select value={filterLeague} onChange={(e) => setFilterLeague(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="all">All Leagues</option>
          {LEAGUES_LIST.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="all">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={form.event_id} onChange={(e) => setForm({ ...form, event_id: e.target.value })}
              className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
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

      <div className="space-y-2">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className={`bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between ${!ticket.is_active ? "opacity-50" : ""}`}>
            <div>
              <h3 className="font-semibold text-foreground">{ticket.events?.title || "Unknown Event"}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {ticket.section} {ticket.row_name && `· Row ${ticket.row_name}`} {ticket.seat_number && `· Seat ${ticket.seat_number}`} · ${ticket.price} · {ticket.quantity - ticket.quantity_sold} remaining
                {ticket.is_reseller_ticket && <span className="ml-2 text-primary">(Reseller)</span>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => openEdit(ticket)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => toggleActive(ticket)}>
                {ticket.is_active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
        {filteredTickets.length === 0 && <p className="text-muted-foreground text-center py-8">No tickets found.</p>}
      </div>

      {/* Edit Dialog with Seat Image Upload */}
      <EditTicketDialog
        editing={editing}
        editForm={editForm}
        setEditForm={setEditForm}
        onClose={() => setEditing(null)}
        onSave={() => { saveEdit(); }}
      />
    </div>
  );
};

// Seat image upload + edit dialog
const EditTicketDialog = ({
  editing, editForm, setEditForm, onClose, onSave,
}: {
  editing: TicketWithEvent | null;
  editForm: { section: string; row_name: string; seat_number: string; price: string; quantity: string };
  setEditForm: (f: any) => void;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [seatImages, setSeatImages] = useState<{ id: string; image_url: string; caption: string | null }[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!editing) { setSeatImages([]); return; }
    supabase.from("seat_images").select("id, image_url, caption").eq("ticket_id", editing.id)
      .then(({ data }) => setSeatImages(data || []));
  }, [editing?.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    const path = `${editing.id}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from("seat-images").upload(path, file);
    if (uploadErr) { toast({ title: "Upload failed", description: uploadErr.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("seat-images").getPublicUrl(path);
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) { setUploading(false); return; }
    const { error: insertErr } = await supabase.from("seat_images").insert({
      ticket_id: editing.id, image_url: urlData.publicUrl, uploaded_by: userId,
    });
    if (insertErr) { toast({ title: "Error", description: insertErr.message, variant: "destructive" }); }
    else {
      const { data: imgs } = await supabase.from("seat_images").select("id, image_url, caption").eq("ticket_id", editing.id);
      setSeatImages(imgs || []);
      toast({ title: "Seat photo uploaded!" });
    }
    setUploading(false);
  };

  const deleteImage = async (imgId: string) => {
    await supabase.from("seat_images").delete().eq("id", imgId);
    setSeatImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Ticket — {editing?.events?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2"><Label>Section</Label><Input value={editForm.section} onChange={(e) => setEditForm({ ...editForm, section: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Row</Label><Input value={editForm.row_name} onChange={(e) => setEditForm({ ...editForm, row_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Seat #</Label><Input value={editForm.seat_number} onChange={(e) => setEditForm({ ...editForm, seat_number: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} /></div>
            <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} /></div>
          </div>

          {/* Seat images */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Seat View Photos</Label>
            {seatImages.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {seatImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt="Seat view" className="w-20 h-14 object-cover rounded-lg border border-border" />
                    <button onClick={() => deleteImage(img.id)} className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-dashed border-border cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload seat photo"}</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>

          <Button onClick={onSave} className="w-full">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTickets;
