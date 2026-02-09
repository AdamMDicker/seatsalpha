import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Tables<"profiles">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

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
            <p className="text-xs text-muted-foreground">Joined {new Date(c.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {customers.length === 0 && <p className="text-muted-foreground text-center py-8">No customers yet.</p>}
      </div>
    </div>
  );
};

export default AdminCustomers;
