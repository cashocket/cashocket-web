"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user"; // Import Hook

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, subscription, loading } = useUser(); // User data fetch karo
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Token Check
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // 2. Subscription Check (Jab data load ho jaye)
    if (!loading) {
      // Agar subscription active ya trialing nahi hai
      if (
        !subscription ||
        (subscription.status !== "active" && subscription.status !== "trialing")
      ) {
        // User ko Subscribe page par bhej do
        router.replace("/subscribe");
      } else {
        // Sab sahi hai, Dashboard dikhao
        setIsAuthorized(true);
      }
    }
  }, [loading, subscription, router]);

  // Loading state (Data fetch hone tak spinner dikhao)
  if (loading || !isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-50/80 dark:bg-zinc-950">
      <aside className="hidden w-64 flex-col md:flex bg-zinc-50/50 dark:bg-zinc-950">
        <AppSidebar />
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden p-2 md:p-3">
        <div className="flex flex-col h-full w-full overflow-hidden rounded-2xl border border-zinc-200 bg-background shadow-sm dark:border-zinc-800">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl p-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
