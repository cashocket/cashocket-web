import { useState, useEffect } from "react";
import api from "@/lib/api";

export interface SubscriptionData {
  status: "trialing" | "active" | "past_due" | "canceled" | "inactive";
  daysLeft: number;
  progress: number; // 0 to 100
  label: string;
  endDate: string | null;
}

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/users/profile");
      setUser(data);

      // --- Subscription Calculation Logic ---
      if (data.subscription && (data.subscription.status === "active" || data.subscription.status === "trialing")) {
        const now = new Date().getTime();
        
        // Trial End ya Period End use karein
        const endDateStr = data.subscription.status === "trialing" 
          ? data.subscription.trialEnd 
          : data.subscription.currentPeriodEnd;
          
        // Start Date logic (approximate for progress bar if not available)
        // Agar periodStart DB se nahi aa raha to hum end date se 30 days minus kar lete hain fallback ke liye
        const startDateStr = data.subscription.currentPeriodStart || 
          new Date(new Date(endDateStr).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const end = new Date(endDateStr).getTime();
        const start = new Date(startDateStr).getTime();
        const totalDuration = end - start;
        const elapsed = now - start;

        // Calculate Days Left
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        
        // Calculate Progress Percentage (0% to 100%)
        // Example: 90 days trial. 10 days passed. Progress = 11% used.
        const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);

        setSubscription({
          status: data.subscription.status,
          daysLeft: daysLeft > 0 ? daysLeft : 0,
          progress,
          label: data.subscription.status === "trialing" ? "Free Trial" : "Pro Plan",
          endDate: endDateStr
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    
    // Listen for global updates (like after profile save)
    window.addEventListener("userDataUpdated", fetchUser);
    return () => window.removeEventListener("userDataUpdated", fetchUser);
  }, []);

  return { user, subscription, loading, refreshUser: fetchUser };
}