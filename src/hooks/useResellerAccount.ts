import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ResellerAccountState {
  hasResellerAccount: boolean;
  isLiveReseller: boolean;
  isLoading: boolean;
}

export const useResellerAccount = (): ResellerAccountState => {
  const { user, isLoading: authLoading } = useAuth();
  const [state, setState] = useState<ResellerAccountState>({
    hasResellerAccount: false,
    isLiveReseller: false,
    isLoading: true,
  });

  useEffect(() => {
    let isCancelled = false;

    if (authLoading) return;

    if (!user) {
      setState({
        hasResellerAccount: false,
        isLiveReseller: false,
        isLoading: false,
      });
      return;
    }

    const fetchResellerAccount = async () => {
      setState((current) => ({ ...current, isLoading: true }));

      const { data, error } = await supabase
        .from("resellers")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (isCancelled) return;

      if (error || !data) {
        setState({
          hasResellerAccount: false,
          isLiveReseller: false,
          isLoading: false,
        });
        return;
      }

      setState({
        hasResellerAccount: true,
        isLiveReseller: data.status === "live",
        isLoading: false,
      });
    };

    fetchResellerAccount();

    return () => {
      isCancelled = true;
    };
  }, [authLoading, user]);

  return state;
};