import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const AdminEvents = () => {
  const [events, setEvents] = useState<Tables<"events">[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Tables<"events"> | null>(null);
  const [form, setForm] = useState({ title: "", venue: "", city: "", province: "", event_date: "", category: "sports", description: "", image_url: "" });
  const { toast } = useToast();

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

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
    setShowForm(false);
    setEditingEvent(null);
    setForm({ title: "", venue: "", city: "", province: "", event_date: "", category: "sports", description: "", image_url: "" });
    fetchEvents();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    fetchEvents();
  };

  const startEdit = (event: Tables<"events">) => {
    setEditingEvent(event);
    setForm({
      title: event.title, venue: event.venue, city: event.city, province: event.province,
      event_date: event.event_date.slice(0, 16), category: event.category,
      description: event.description || "", image_url: event.image_url || "",
    });
    setShowForm(true);
  };

  if (loading) return <p className="text-muted-foreground">Loading events...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-xl font-semibold">Events ({events.length})</h2>
        <Button variant="hero" size="sm" onClick={() => { setShowForm(!showForm); setEditingEvent(null); setForm({ title: "", venue: "", city: "", province: "", event_date: "", category: "sports", description: "", image_url: "" }); }}>
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-xl p-6 mb-6 space-y-4">
          <h3 className="font-display font-semibold">{editingEvent ? "Edit Event" : "New Event"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Event Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input placeholder="Venue *" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input placeholder="Province *" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
              <option value="sports">Sports</option>
              <option value="concerts">Concerts</option>
              <option value="theatre">Theatre</option>
            </select>
            <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
          </div>
          <div className="flex gap-2">
            <Button variant="hero" size="sm" onClick={handleSave}>Save</Button>
            <Button variant="glass" size="sm" onClick={() => { setShowForm(false); setEditingEvent(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.venue}, {event.city} · {new Date(event.event_date).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => startEdit(event)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-muted-foreground text-center py-8">No events yet. Add one or import via CSV.</p>}
      </div>
    </div>
  );
};

export default AdminEvents;
