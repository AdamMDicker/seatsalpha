import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

const AdminResellers = () => {
  const [resellers, setResellers] = useState<Tables<"resellers">[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchResellers = async () => {
    const { data } = await supabase.from("resellers").select("*");
    setResellers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResellers(); }, []);

  const toggleEnabled = async (reseller: Tables<"resellers">) => {
    const { error } = await supabase.from("resellers").update({ is_enabled: !reseller.is_enabled }).eq("id", reseller.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: reseller.is_enabled ? "Reseller disabled" : "Reseller enabled" });
    fetchResellers();
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-6">Resellers ({resellers.length})</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Resellers sign up as regular users and apply for reseller status. Enable their accounts here to let their tickets appear on the site.
      </p>

      <div className="space-y-3">
        {resellers.map((r) => (
          <div key={r.id} className="glass rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{r.business_name}</h3>
              <p className="text-sm text-muted-foreground">
                Joined {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant={r.is_enabled ? "destructive" : "hero"}
              size="sm"
              onClick={() => toggleEnabled(r)}
            >
              {r.is_enabled ? "Disable" : "Enable"}
            </Button>
          </div>
        ))}
        {resellers.length === 0 && <p className="text-muted-foreground text-center py-8">No reseller applications yet.</p>}
      </div>
    </div>
  );
};

export default AdminResellers;
