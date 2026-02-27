import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ban, Plus, Trash2, Search, Mail, Phone, Globe } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BannedUser {
  id: string;
  email: string | null;
  phone: string | null;
  ip_address: string | null;
  ban_type: string;
  reason: string | null;
  banned_by: string | null;
  created_at: string;
}

const banTypeConfig = {
  email: { icon: Mail, label: "Email", color: "default" as const },
  phone: { icon: Phone, label: "Phone", color: "secondary" as const },
  ip: { icon: Globe, label: "IP Address", color: "outline" as const },
};

const AdminBannedUsers = () => {
  const { user } = useAuth();
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [banType, setBanType] = useState<"email" | "phone" | "ip">("email");
  const [newValue, setNewValue] = useState("");
  const [newReason, setNewReason] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBannedUsers = async () => {
    const { data, error } = await supabase
      .from("banned_users")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load banned users");
    setBannedUsers((data as BannedUser[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchBannedUsers(); }, []);

  const banUser = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) { toast.error("Value is required"); return; }
    setSaving(true);

    const insertData: Record<string, unknown> = {
      ban_type: banType,
      reason: newReason.trim() || null,
      banned_by: user?.id || null,
    };

    if (banType === "email") insertData.email = trimmed.toLowerCase();
    else if (banType === "phone") insertData.phone = trimmed;
    else insertData.ip_address = trimmed;

    const { error } = await supabase.from("banned_users").insert(insertData);
    if (error) {
      if (error.code === "23505") toast.error("This value is already banned");
      else toast.error("Failed to ban");
      setSaving(false);
      return;
    }
    toast.success(`${trimmed} has been banned`);
    setSaving(false);
    setShowAddDialog(false);
    setNewValue("");
    setNewReason("");
    fetchBannedUsers();
  };

  const unbanUser = async (banned: BannedUser) => {
    const { error } = await supabase.from("banned_users").delete().eq("id", banned.id);
    if (error) { toast.error("Failed to unban"); return; }
    toast.success(`${banned.email || banned.phone || banned.ip_address} has been unbanned`);
    fetchBannedUsers();
  };

  const getDisplayValue = (b: BannedUser) => b.email || b.phone || b.ip_address || "Unknown";

  const filtered = bannedUsers.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return getDisplayValue(b).toLowerCase().includes(q) ||
      (b.reason || "").toLowerCase().includes(q) ||
      b.ban_type.toLowerCase().includes(q);
  });

  const placeholderMap = { email: "user@example.com", phone: "+1 (416) 555-0123", ip: "192.168.1.1" };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold">Banned Users ({bannedUsers.length})</h2>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Ban User
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search by email, phone, IP or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((b) => {
          const config = banTypeConfig[b.ban_type as keyof typeof banTypeConfig] || banTypeConfig.email;
          const Icon = config.icon;
          return (
            <div key={b.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-destructive" />
                  <h3 className="font-semibold text-foreground">{getDisplayValue(b)}</h3>
                  <Badge variant={config.color} className="text-xs gap-1">
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
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
          );
        })}
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
              <Label>Ban Type</Label>
              <Select value={banType} onValueChange={(v) => { setBanType(v as "email" | "phone" | "ip"); setNewValue(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span></SelectItem>
                  <SelectItem value="phone"><span className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</span></SelectItem>
                  <SelectItem value="ip"><span className="flex items-center gap-2"><Globe className="h-4 w-4" /> IP Address</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{banType === "email" ? "Email Address" : banType === "phone" ? "Phone Number" : "IP Address"}</Label>
              <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={placeholderMap[banType]} />
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
