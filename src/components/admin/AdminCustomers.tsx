import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye, EyeOff, ShoppingCart, Search, Ban, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type OrderWithItems = Tables<"orders"> & {
  order_items: (Tables<"order_items"> & { tickets: { section: string; row_name: string | null; events: { title: string } | null } | null })[];
};

type CustomerWithMeta = Tables<"profiles"> & {
  orderCount?: number;
  totalSpent?: number;
  hasMembership?: boolean;
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Tables<"profiles"> | null>(null);
  const [form, setForm] = useState({ full_name: "", city: "", province: "" });
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewingOrders, setViewingOrders] = useState<Tables<"profiles"> | null>(null);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvince, setFilterProvince] = useState("all");
  const [filterMembership, setFilterMembership] = useState<"all" | "active" | "none">("all");
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerWithMeta | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (!profiles) { setLoading(false); return; }

    // Fetch order stats per customer
    const enriched: CustomerWithMeta[] = [];
    for (const p of profiles) {
      const { data: orderData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("user_id", p.user_id);
      const { data: membershipData } = await supabase
        .from("memberships")
        .select("id")
        .eq("user_id", p.user_id)
        .eq("is_active", true)
        .limit(1);

      enriched.push({
        ...p,
        orderCount: orderData?.length || 0,
        totalSpent: (orderData || []).reduce((s, o) => s + Number(o.total_amount), 0),
        hasMembership: (membershipData || []).length > 0,
      });
    }
    setCustomers(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openEdit = (c: Tables<"profiles">) => {
    setEditing(c);
    setForm({ full_name: c.full_name || "", city: c.city || "", province: c.province || "" });
    setNewPassword("");
    setShowPassword(false);
  };

  const openOrders = async (c: Tables<"profiles">) => {
    setViewingOrders(c);
    setOrdersLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, tickets(section, row_name, events(title)))")
      .eq("user_id", c.user_id)
      .order("created_at", { ascending: false });
    setOrders((data as OrderWithItems[]) || []);
    setOrdersLoading(false);
  };

  const saveProfile = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: form.full_name.trim(), city: form.city.trim() || null, province: form.province.trim() || null })
      .eq("id", editing.id);
    if (error) { toast.error("Failed to update profile"); setSaving(false); return; }

    if (newPassword.length > 0) {
      if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); setSaving(false); return; }
      const res = await supabase.functions.invoke("admin-update-password", {
        body: { user_id: editing.user_id, new_password: newPassword },
      });
      if (res.error || res.data?.error) { toast.error(res.data?.error || "Failed to update password"); setSaving(false); return; }
    }

    toast.success("Customer updated");
    setSaving(false);
    setEditing(null);
    fetchCustomers();
  };

  const deleteCustomer = async () => {
    if (!deletingCustomer) return;
    setDeleting(true);
    const res = await supabase.functions.invoke("admin-delete-user", {
      body: { user_id: deletingCustomer.user_id },
    });
    if (res.error || res.data?.error) {
      toast.error(res.data?.error || "Failed to delete user");
    } else {
      toast.success("User deleted successfully");
      fetchCustomers();
    }
    setDeleting(false);
    setDeletingCustomer(null);
  };

  // Unique provinces from customer data
  const usedProvinces = [...new Set(customers.map((c) => c.province).filter(Boolean))] as string[];

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = !searchQuery ||
      (c.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = filterProvince === "all" || c.province === filterProvince;
    const matchesMembership = filterMembership === "all" ||
      (filterMembership === "active" && c.hasMembership) ||
      (filterMembership === "none" && !c.hasMembership);
    return matchesSearch && matchesProvince && matchesMembership;
  });

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">Customers ({customers.length})</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search by name or city..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm" />
        </div>
        <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm">
          <option value="all">All Provinces</option>
          {usedProvinces.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex gap-1.5">
          {(["all", "active", "none"] as const).map((m) => (
            <button key={m} onClick={() => setFilterMembership(m)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                filterMembership === m ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}>
              {m === "all" ? "All" : m === "active" ? "Members" : "Non-Members"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredCustomers.map((c) => (
          <div key={c.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{c.full_name || "No name"}</h3>
                {c.hasMembership && <Badge variant="default" className="text-[10px]">Member</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {c.city && c.province ? `${c.city}, ${c.province}` : c.city || c.province || "No location"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.orderCount} orders · ${(c.totalSpent || 0).toFixed(0)} spent · Joined {new Date(c.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openOrders(c)}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Orders
              </Button>
              <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setDeletingCustomer(c)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
        {filteredCustomers.length === 0 && <p className="text-muted-foreground text-center py-8">No customers found.</p>}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Customer</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Full Name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-2"><Label>Province</Label><Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} /></div>
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

      {/* Orders Dialog */}
      <Dialog open={!!viewingOrders} onOpenChange={(o) => !o && setViewingOrders(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Orders — {viewingOrders?.full_name || "Customer"}</DialogTitle></DialogHeader>
          {ordersLoading ? (
            <p className="text-muted-foreground py-4">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No orders found.</p>
          ) : (
            <div className="space-y-4 pt-2">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">${Number(order.total_amount).toFixed(2)}</p>
                    <Badge variant={order.status === "completed" ? "default" : order.status === "pending" ? "secondary" : "destructive"}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  {order.is_fee_waived && <p className="text-xs text-primary">Member — fees waived</p>}
                  {order.order_items.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {order.order_items.map((item) => (
                        <p key={item.id} className="text-xs text-muted-foreground">
                          {item.tickets?.events?.title || "Event"} — {item.tickets?.section}{item.tickets?.row_name ? `, Row ${item.tickets.row_name}` : ""} × {item.quantity} @ ${Number(item.unit_price).toFixed(2)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
