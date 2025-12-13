"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export function SubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      // 1. Backend se Checkout Session create karein
      const { data } = await api.post("/payments/create-checkout-session");

      // 2. Stripe Checkout URL par redirect karein
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Subscription Error:", error);
      toast.error(error.response?.data?.message || "Failed to start payment.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all hover:scale-[1.02]"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Zap className="mr-2 h-4 w-4 fill-current" />
      )}
      Start 3-Month Free Trial
    </Button>
  );
}
