import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, X, Search, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { TEAMS_VENUES, LEAGUES_LIST } from "@/data/teamsVenues";

interface TicketForEvent {
  id: string;
  section: string;
  row_name: string | null;
  seat_number: string | null;
  price: number;
  quantity: number;
  quantity_sold: number;
  is_active: boolean;
  is_reseller_ticket: boolean;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Tables<"events"> | null>(null);
  const [form, setForm] = useState({
    title: "", venue: "", city: "", province: "", event_date: "",
    category: "sports", description: "", image_url: "",
  });
  const [selectedTeam, setSelectedTeam] = useState("");
  const [opponent, setOpponent] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeague, setFilterLeague] = useState("all");

  // Event tickets
  const [eventTickets, setEventTickets] = useState<TicketForEvent[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Record<string, TicketForEvent[]>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const fetchTicketsForEvent = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(eventId);
    if (expandedTickets[eventId]) return;

    setLoadingTickets(true);
    const { data } = await supabase
      .from("tickets")
      .select("id, section, row_name, seat_number, price, quantity, quantity_sold, is_active, is_reseller_ticket")
      .eq("event_id", eventId)
      .order("section", { ascending: true });
    setExpandedTickets((prev) => ({ ...prev, [eventId]: data || [] }));
    setLoadingTickets(false);
  };

  const fetchTicketsForEdit = async (eventId: string) => {
    const { data, error } = await supabase
      .from("tickets")
      .select("id, section, row_name, seat_number, price, quantity, quantity_sold, is_active, is_reseller_ticket")
      .eq("event_id", eventId)
      .order("section", { ascending: true });
    if (error) {
      console.error("Error fetching tickets for edit:", error);
      toast({ title: "Error loading tickets", description: error.message, variant: "destructive" });
    }
    setEventTickets(data || []);
  };

  const handleTeamSelect = (teamName: string) => {
    setSelectedTeam(teamName);
    const tv = TEAMS_VENUES.find((t) => t.team === teamName);
    if (tv) {
      setForm((f) => ({
        ...f,
        venue: tv.venue,
        city: tv.city,
        province: tv.province,
        title: opponent ? `${tv.team} vs ${opponent}` : tv.team,
      }));
    }
  };

  const handleOpponentChange = (opp: string) => {
    setOpponent(opp);
    if (selectedTeam) {
      setForm((f) => ({ ...f, title: opp ? `${selectedTeam} vs ${opp}` : selectedTeam }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be under 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `events/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("event-images").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("event-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast({ title: "Image uploaded!" });
  };

  const handleSave = async () => {
    if (!form.title || !form.venue || !form.city || !form.province || !form.event_date) {
      toast({ title: "Error", description: "Fill in all required fields", variant: "destructive" });
      return;
    }
    if (editingEvent) {
      const { error } = await supabase.from("events").update(form).eq("id", editingEvent.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("events").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Saved!" });
    resetForm();
    fetchEvents();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setSelectedTeam("");
    setOpponent("");
    setEventTickets([]);
    setForm({ title: "", venue: "", city: "", province: "", event_date: "", category: "sports", description: "", image_url: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    fetchEvents();
  };

  const startEdit = async (event: Tables<"events">) => {
    setEditingEvent(event);
    setForm({
      title: event.title, venue: event.venue, city: event.city, province: event.province,
      event_date: event.event_date.slice(0, 16), category: event.category,
      description: event.description || "", image_url: event.image_url || "",
    });
    setSelectedTeam("");
    setOpponent("");
    setShowForm(true);
    await fetchTicketsForEdit(event.id);
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.venue.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeague = filterLeague === "all" || TEAMS_VENUES.some((tv) => tv.league === filterLeague && e.title.includes(tv.team));
    return matchesSearch && matchesLeague;
  });

  const groupedTeams = LEAGUES_LIST.reduce((acc, league) => {
    acc[league] = TEAMS_VENUES.filter((tv) => tv.league === league);
    return acc;
  }, {} as Record<string, typeof TEAMS_VENUES>);

  if (loading) return <p className="text-muted-foreground">Loading events...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-semibold">Events ({events.length})</h2>
        <Button variant="hero" size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", ...LEAGUES_LIST].map((l) => (
            <button
              key={l}
              onClick={() => setFilterLeague(l)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterLeague === l
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {l === "all" ? "All" : l}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-display font-semibold">{editingEvent ? "Edit Event" : "New Event"}</h3>

          {/* Team selector (only for new events) */}
          {!editingEvent && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Select Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => handleTeamSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
              >
                <option value="">— Choose a team (auto-fills venue & city) —</option>
                {Object.entries(groupedTeams).map(([league, teams]) => (
                  <optgroup key={league} label={league}>
                    {teams.map((tv) => (
                      <option key={tv.team} value={tv.team}>{tv.team}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {/* Opponent */}
          {!editingEvent && selectedTeam && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Opponent / Event Name</label>
              <input
                placeholder="e.g. New York Yankees"
                value={opponent}
                onChange={(e) => handleOpponentChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
              />
              <p className="text-xs text-muted-foreground">Title will auto-generate: "{form.title}"</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Event Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Venue *</label>
              <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">City *</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Province *</label>
              <input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date & Time *</label>
              <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
                <option value="sports">Sports</option>
                <option value="concerts">Concerts</option>
                <option value="theatre">Theatre</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" placeholder="Home game, special promo, etc." />
            </div>
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Event Image</label>
            <div className="flex items-center gap-4">
              {form.image_url ? (
                <div className="relative">
                  <img src={form.image_url} alt="Event" className="w-24 h-16 object-cover rounded-lg border border-border" />
                  <button onClick={() => setForm({ ...form, image_url: "" })} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload Image (max 5MB)"}
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* Tickets for this event (shown when editing) */}
          {editingEvent && (() => {
            const featured = eventTickets.filter(t => !t.is_reseller_ticket);
            const reseller = eventTickets.filter(t => t.is_reseller_ticket);
            const TicketTable = ({ tickets, label, color }: { tickets: TicketForEvent[]; label: string; color: string }) => (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold ${color}`}>{label} ({tickets.length})</span>
                  <span className="text-xs text-muted-foreground">
                    {tickets.reduce((s, t) => s + (t.quantity - t.quantity_sold), 0)} remaining
                  </span>
                </div>
                {tickets.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-secondary sticky top-0">
                          <th className="text-left p-2 font-medium text-muted-foreground">Section</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Row</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">Seats</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Price</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Qty</th>
                          <th className="text-right p-2 font-medium text-muted-foreground">Sold</th>
                          <th className="text-center p-2 font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((t) => (
                          <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/50">
                            <td className="p-2 text-foreground font-medium">{t.section}</td>
                            <td className="p-2 text-foreground">{t.row_name || "—"}</td>
                            <td className="p-2 text-foreground">{t.seat_number || "—"}</td>
                            <td className="p-2 text-foreground text-right">${t.price}</td>
                            <td className="p-2 text-foreground text-right">{t.quantity}</td>
                            <td className="p-2 text-foreground text-right">{t.quantity_sold}</td>
                            <td className="p-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                t.is_active ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"
                              }`}>
                                {t.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">None</p>
                )}
              </div>
            );
            return (
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-primary" />
                  <h4 className="font-display font-semibold text-sm">All Tickets ({eventTickets.length})</h4>
                </div>
                <TicketTable tickets={featured} label="⭐ Our Tickets (Featured)" color="text-primary" />
                <TicketTable tickets={reseller} label="🏷️ Reseller Tickets" color="text-amber-400" />
              </div>
            );
          })()}

          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={handleSave}>Save</Button>
            <Button variant="glass" size="sm" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filteredEvents.map((event) => {
          const isExpanded = expandedEventId === event.id;
          const tickets = expandedTickets[event.id] || [];

          return (
            <div key={event.id} className="glass rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between gap-3">
                {event.image_url && (
                  <img src={event.image_url} alt="" className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.venue}, {event.city} · {new Date(event.event_date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fetchTicketsForEvent(event.id)}
                    className={isExpanded ? "text-primary" : ""}
                    title="View tickets"
                  >
                    <Ticket className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(event)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>

              {/* Inline ticket list */}
              {isExpanded && (
                <div className="border-t border-border bg-secondary/30 px-4 py-3 animate-fade-in">
                  {loadingTickets && !expandedTickets[event.id] ? (
                    <p className="text-xs text-muted-foreground">Loading tickets...</p>
                  ) : tickets.length > 0 ? (() => {
                    const featured = tickets.filter(t => !t.is_reseller_ticket);
                    const reseller = tickets.filter(t => t.is_reseller_ticket);
                    const TicketGroup = ({ items, label, color }: { items: TicketForEvent[]; label: string; color: string }) => items.length > 0 ? (
                      <div>
                        <p className={`text-xs font-semibold mb-1.5 ${color}`}>{label} ({items.length}) · {items.reduce((s, t) => s + (t.quantity - t.quantity_sold), 0)} remaining</p>
                        {items.map((t) => (
                          <div key={t.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-background/50 mb-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-foreground">Sec {t.section}</span>
                              {t.row_name && <span className="text-muted-foreground">Row {t.row_name}</span>}
                              {t.seat_number && <span className="text-muted-foreground">Seats {t.seat_number}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-foreground">${t.price}</span>
                              <span className="text-muted-foreground">{t.quantity - t.quantity_sold} left</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null;
                    return (
                      <div className="space-y-3">
                        <TicketGroup items={featured} label="⭐ Our Tickets" color="text-primary" />
                        <TicketGroup items={reseller} label="🏷️ Reseller Tickets" color="text-amber-400" />
                      </div>
                    );
                  })() : (
                    <p className="text-xs text-muted-foreground">No tickets listed for this event.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filteredEvents.length === 0 && <p className="text-muted-foreground text-center py-8">No events found.</p>}
      </div>
    </div>
  );
};

export default AdminEvents;
