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

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dodo-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { checkout_url } = await response.json();
      
      // Redirect to Dodo checkout
      if (checkout_url) {
        window.location.href = checkout_url;
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
