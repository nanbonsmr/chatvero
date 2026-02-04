import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  dodo_transaction_id: string | null;
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async (): Promise<Subscription | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        throw error;
      }

      return data as Subscription | null;
    },
    enabled: !!user?.id,
  });
};

export const useCancelSubscription = () => {
  const { user } = useAuth();

  const cancelSubscription = async () => {
    if (!user?.id) throw new Error("Not authenticated");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error("No session");
    }

    // For now, we'll just update the status locally
    // In production, you'd call Dodo's API to cancel
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error) throw error;
  };

  return { cancelSubscription };
};
