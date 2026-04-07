import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Tag } from "lucide-react";

interface DiscountCode {
  id: string;
  code: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
}

const AdminSellerCodes = () => {
  const { toast } = useToast();
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCodes = async () => {
    const { data, error } = await supabase
      .from("seller_discount_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCodes(data);
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, []);

  const handleAdd = async () => {
    if (!newCode.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("seller_discount_codes").insert({
      code: newCode.trim().toUpperCase(),
      description: newDesc.trim() || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code added" });
      setNewCode("");
      setNewDesc("");
      fetchCodes();
    }
    setAdding(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from("seller_discount_codes").update({ is_active: !current }).eq("id", id);
    fetchCodes();
  };

  const deleteCode = async (id: string) => {
    await supabase.from("seller_discount_codes").delete().eq("id", id);
    fetchCodes();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        Seller Discount Codes
      </h2>

      {/* Add new code */}
      <div className="glass rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <input
          value={newCode}
          onChange={(e) => setNewCode(e.target.value.toUpperCase())}
          placeholder="CODE"
          maxLength={30}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm w-full sm:w-40"
        />
        <input
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description (optional)"
          maxLength={100}
          className="px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm flex-1"
        />
        <Button onClick={handleAdd} disabled={adding || !newCode.trim()} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {/* Code list */}
      <div className="space-y-2">
        {codes.map((c) => (
          <div key={c.id} className="glass rounded-lg p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <code className="font-mono text-sm font-bold">{c.code}</code>
              {c.description && (
                <span className="text-xs text-muted-foreground truncate">{c.description}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={c.is_active ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleActive(c.id, c.is_active)}
              >
                {c.is_active ? "Active" : "Inactive"}
              </Badge>
              <Button variant="ghost" size="icon" onClick={() => deleteCode(c.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        {codes.length === 0 && <p className="text-sm text-muted-foreground">No discount codes.</p>}
      </div>
    </div>
  );
};

export default AdminSellerCodes;
