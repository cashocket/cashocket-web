"use client";

import { UserNav } from "@/components/user-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const pathname = usePathname();

  // Breadcrumb logic (Simple)
  const pageName = pathname.split("/").pop() || "Overview";
  const formattedTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Title / Breadcrumb */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            {formattedTitle === "Dashboard" ? "Overview" : formattedTitle}
          </h1>
          {/* Optional Date or Subtitle */}
          <p className="text-xs text-muted-foreground hidden md:block">
            Welcome back, manage your finance.
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
