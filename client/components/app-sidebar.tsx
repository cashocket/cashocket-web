"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress"; // Ensure Progress component exists
import { useUser } from "@/hooks/use-user"; // Import hook
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  PieChart,
  Settings,
  Layers,
  Landmark,
  Sparkles,
  Clock,
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { subscription, loading } = useUser(); // Hook se data lo

  const routes = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Income", icon: TrendingUp, href: "/dashboard/income" },
    { label: "Expenses", icon: TrendingDown, href: "/dashboard/expenses" },
    { label: "Transfers", icon: ArrowRightLeft, href: "/dashboard/transfers" },
    { label: "Budgets", icon: PieChart, href: "/dashboard/budgets" },
    { label: "Accounts", icon: Landmark, href: "/dashboard/accounts" },
    { label: "Categories", icon: Layers, href: "/dashboard/categories" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className={cn("flex flex-col h-full py-4", className)}>
      {/* Brand Logo */}
      <div className="px-6 pb-6 flex items-center">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">
            Cashocket
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all",
                  pathname === route.href
                    ? "bg-white shadow-sm text-black border border-gray-200 dark:bg-zinc-800 dark:text-white dark:border-zinc-700"
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* Dynamic Footer / User Info */}
      <div className="px-4 mt-auto pt-4 border-t border-border/40">
        {!loading && subscription ? (
          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  subscription.status === "trialing"
                    ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                )}
              >
                {subscription.status === "trialing" ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">
                  {subscription.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {subscription.daysLeft} days left
                </span>
              </div>
            </div>
            {/* Mini Progress Bar */}
            <Progress
              value={subscription.progress}
              className="h-1.5 bg-zinc-200 dark:bg-zinc-700"
            />
          </div>
        ) : (
          /* Agar Free Plan hai to Upgrade Card dikhao */
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary">Go Pro</span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-3 leading-tight">
              Unlock unlimited accounts & AI insights.
            </p>
            <Link href="/dashboard/settings">
              <Button size="sm" className="w-full h-8 text-xs rounded-lg">
                Upgrade
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
