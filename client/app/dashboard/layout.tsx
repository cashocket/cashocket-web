"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, subscription, loading, refreshUser } = useUser(); // refreshUser add kiya
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. Initial Check & Watchdog Timer
  useEffect(() => {
    // Har 1 minute (60000ms) mein status refresh karo
    const interval = setInterval(() => {
      console.log("🔍 Checking Subscription Status...");
      refreshUser(); // Background mein data fetch karega
    }, 60000);

    return () => clearInterval(interval); // Cleanup
  }, [refreshUser]);

  // 2. Strict Security Check (Har baar jab data update ho)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!loading) {
      // Agar subscription active/trialing nahi hai -> KICK OUT
      if (
        !subscription ||
        (subscription.status !== "active" && subscription.status !== "trialing")
      ) {
        // Redirect to subscribe page
        router.replace("/subscribe");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [loading, subscription, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Verifying access...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-50/80 dark:bg-zinc-950">
      <aside className="hidden w-64 flex-col md:flex bg-zinc-50/50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
        <AppSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex flex-col h-full w-full overflow-hidden bg-background">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50 p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
