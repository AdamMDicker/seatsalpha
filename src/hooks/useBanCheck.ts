import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useBanCheck = () => {
  const { user } = useAuth();
  const [isBanned, setIsBanned] = useState(false);
  const [banLoading, setBanLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (!user?.email) { setBanLoading(false); return; }
      const { data } = await supabase.rpc("is_email_banned", { _email: user.email });
      setIsBanned(!!data);
      setBanLoading(false);
    };
    check();
  }, [user?.email]);

  return { isBanned, banLoading };
};
