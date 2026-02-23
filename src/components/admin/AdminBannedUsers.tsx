import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Ban, Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface BannedUser {
  id: string;
  email: string;
  reason: string | null;
  banned_by: string | null;
  created_at: string;
}

const AdminBannedUsers = () => {
  const { user } = useAuth();
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBannedUsers = async () => {
    const { data, error } = await supabase
      .from("banned_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load banned users"); }
    setBannedUsers((data as BannedUser[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBannedUsers(); }, []);

  const banUser = async () => {
    if (!newEmail.trim()) { toast.error("Email is required"); return; }
    setSaving(true);
    const { error } = await supabase.from("banned_users").insert({
      email: newEmail.trim().toLowerCase(),
      reason: newReason.trim() || null,
      banned_by: user?.id || null,
    });
    if (error) {
      if (error.code === "23505") toast.error("This email is already banned");
      else toast.error("Failed to ban user");
      setSaving(false);
      return;
    }
    toast.success(`${newEmail.trim()} has been banned`);
    setSaving(false);
    setShowAddDialog(false);
    setNewEmail("");
    setNewReason("");
    fetchBannedUsers();
  };

  const unbanUser = async (banned: BannedUser) => {
    const { error } = await supabase.from("banned_users").delete().eq("id", banned.id);
    if (error) { toast.error("Failed to unban user"); return; }
    toast.success(`${banned.email} has been unbanned`);
    fetchBannedUsers();
  };

  const filtered = bannedUsers.filter((b) =>
    !searchQuery || b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.reason || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold">Banned Users ({bannedUsers.length})</h2>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Ban Email
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by email or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" />
                <h3 className="font-semibold text-foreground">{b.email}</h3>
              </div>
              {b.reason && <p className="text-sm text-muted-foreground mt-0.5">{b.reason}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">
                Banned {new Date(b.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => unbanUser(b)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Unban
            </Button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            {bannedUsers.length === 0 ? "No banned users yet." : "No results found."}
          </p>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ban a User</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Ticket flipper, scalper" />
            </div>
            <Button onClick={banUser} disabled={saving} className="w-full">
              {saving ? "Banning..." : "Ban User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBannedUsers;
