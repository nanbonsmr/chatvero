import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDodoCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (plan: "starter" | "growth" | "business") => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("dodo-checkout", {
        body: { plan },
      });

      if (error) {
        throw new Error(error.message || "Failed to create checkout session");
      }

      const checkout_url = (data as any)?.checkout_url as string | undefined;
      
      // Redirect to Dodo checkout
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        throw new Error("Missing checkout_url from server");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return { createCheckoutSession, loading, error };
};
