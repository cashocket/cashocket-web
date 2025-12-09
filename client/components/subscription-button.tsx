"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useScript } from "@/hooks/use-script";

export function SubscriptionButton() {
  const [loading, setLoading] = useState(false);

  // Razorpay SDK load karo
  const isRazorpayLoaded = useScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );

  const handleSubscribe = async () => {
    if (!isRazorpayLoaded) {
      toast.error("Payment SDK not loaded yet. Please check connection.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Subscription (Backend)
      const { data } = await api.post("/payments/create-subscription");

      if (!data.id) throw new Error("Subscription ID missing");

      // 2. Razorpay Options
      const options = {
        key: data.key_id, // Backend se aaya hua Key ID
        subscription_id: data.id,
        name: "Cashocket Pro",
        description: "3 Months Free Trial",
        image: "https://github.com/shadcn.png", // Aap apna logo URL daal sakte hain

        // Success Handler
        handler: async function (response: any) {
          try {
            toast.loading("Verifying payment...");

            // 3. Verify Payment (Backend)
            await api.post("/payments/verify-subscription", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.dismiss(); // Loading hatao
            toast.success("Subscription Active! 🎉 Trial Started.");

            // Page reload taaki naya status reflect ho
            window.location.reload();
          } catch (err) {
            toast.dismiss();
            toast.error("Verification Failed. Contact Support.");
            console.error(err);
          }
        },

        theme: {
          color: "#10b981", // Emerald Green (App Theme Match)
        },
        prefill: {
          // Aap chahein toh user ka email/phone auto-fill kar sakte hain agar context mein hai
          // name: "User Name",
          // email: "user@example.com"
        },
      };

      // 4. Open Razorpay
      // @ts-ignore (Kyunki Razorpay window object pe directly nahi hota TS mein)
      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment Failed");
      });

      rzp.open();
    } catch (error) {
      console.error("Payment Start Error:", error);
      toast.error("Could not initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading || !isRazorpayLoaded}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Zap className="mr-2 h-4 w-4 fill-current" />
      )}
      Start 3 Months Free Trial
    </Button>
  );
}
