"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex h-screen w-full bg-zinc-50/80 dark:bg-zinc-950">
      {/* SIDEBAR AREA */}
      {/* Change: 'border-r' aur border colors hata diye hain */}
      <aside className="hidden w-64 flex-col md:flex bg-zinc-50/50 dark:bg-zinc-950">
        <AppSidebar />
      </aside>

      {/* MAIN CONTENT AREA (The Floating Island) */}
      <div className="flex flex-1 flex-col overflow-hidden p-2 md:p-3">
        {/* Is container ka border aur shadow hi separation create karega */}
        <div className="flex flex-col h-full w-full overflow-hidden rounded-2xl border border-zinc-200 bg-background shadow-sm dark:border-zinc-800">
          {/* Header sits inside the rounded container */}
          <DashboardHeader />

          {/* Scrollable Page Content */}
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
