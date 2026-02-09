import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tables<"profiles"> | null>(null);
  const [form, setForm] = useState({ full_name: "", city: "", province: "" });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openEdit = (c: Tables<"profiles">) => {
    setEditing(c);
    setForm({ full_name: c.full_name || "", city: c.city || "", province: c.province || "" });
    setNewPassword("");
    setShowPassword(false);
  };

  const saveProfile = async () => {
    if (!editing) return;
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name.trim(), city: form.city.trim() || null, province: form.province.trim() || null })
      .eq("id", editing.id);

    if (error) {
      toast.error("Failed to update profile");
      setSaving(false);
      return;
    }

    if (newPassword.length > 0) {
      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        setSaving(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-update-password", {
        body: { user_id: editing.user_id, new_password: newPassword },
      });
      if (res.error || res.data?.error) {
        toast.error(res.data?.error || "Failed to update password");
        setSaving(false);
        return;
      }
    }

    toast.success("Customer updated");
    setSaving(false);
    setEditing(null);
    fetchCustomers();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">Customers ({customers.length})</h2>
      <div className="space-y-3">
        {customers.map((c) => (
          <div key={c.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{c.full_name || "No name"}</h3>
              <p className="text-sm text-muted-foreground">
                {c.city && c.province ? `${c.city}, ${c.province}` : c.city || c.province || "No location"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">Joined {new Date(c.created_at).toLocaleDateString()}</p>
              <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            </div>
          </div>
        ))}
        {customers.length === 0 && <p className="text-muted-foreground text-center py-8">No customers yet.</p>}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Province</Label>
                <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password (leave blank to keep current)</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={saveProfile} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
