// cashocket/client/components/dashboard-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Layers,
  Settings,
  ArrowLeftRight,
  Zap,
} from "lucide-react";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const routes = [
  { label: "Overview", icon: LayoutGrid, href: "/dashboard" },
  { label: "Income", icon: TrendingUp, href: "/dashboard/income" },
  { label: "Expenses", icon: TrendingDown, href: "/dashboard/expenses" },
  { label: "Budgets", icon: PieChart, href: "/dashboard/budgets" },
  { label: "Accounts", icon: Wallet, href: "/dashboard/accounts" },
  { label: "Categories", icon: Layers, href: "/dashboard/categories" },
  { label: "Transfers", icon: ArrowLeftRight, href: "/dashboard/transfers" },
];

export function DashboardSidebar({
  isCollapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    // Sidebar container: Full height/width for the wrapper div
    <div className="h-full flex flex-col bg-card p-4">
      {/* --- Brand Area --- */}
      <div className="mb-6 mt-2 border-b border-border pb-4">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          {!isCollapsed && ( // Text hides when collapsed
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Cashocket
            </h1>
          )}
        </Link>
      </div>

      {/* --- Menu Links --- */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-2">
        {!isCollapsed && ( // Heading hides when collapsed
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Navigation
          </p>
        )}

        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                isCollapsed ? "justify-center px-0" : "px-3" // Center icons when collapsed
              )}
            >
              <route.icon
                className="h-5 w-5 flex-shrink-0"
                strokeWidth={1.75}
              />
              {!isCollapsed && ( // Text hides when collapsed
                <span className="truncate">{route.label}</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* --- Footer Section --- */}
      <div className="mt-auto space-y-3 pt-4 border-t border-border">
        {/* Pro Plan Card */}
        {!isCollapsed && ( // Card hides when collapsed
          <div className="bg-secondary rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-primary rounded-full text-primary-foreground">
                <Zap className="h-3 w-3 fill-current" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Go Pro
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock advanced features & analytics.
            </p>
            <button className="w-full py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-md transition-opacity">
              Upgrade Now
            </button>
          </div>
        )}

        {/* Settings Link */}
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors",
            isCollapsed ? "justify-center px-0" : "px-3" // Center icons when collapsed
          )}
        >
          <Settings className="h-5 w-5 flex-shrink-0" strokeWidth={1.75} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
}
