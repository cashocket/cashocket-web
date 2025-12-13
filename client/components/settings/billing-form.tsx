"use client";

import { useUser } from "@/hooks/use-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  ShieldCheck,
  LayoutDashboard,
  CalendarClock,
  CreditCard,
} from "lucide-react";
import { SubscriptionButton } from "@/components/subscription-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // <--- YE LINE MISSING THI

export function BillingForm() {
  const { user, subscription, loading } = useUser();

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-xl" />;
  }

  // --- PRO / TRIAL USER UI ---
  if (subscription) {
    const isTrial = subscription.status === "trialing";

    return (
      <Card
        className={cn(
          "border overflow-hidden",
          isTrial
            ? "border-amber-500/30 bg-amber-50/10 dark:bg-amber-950/10"
            : "border-emerald-500/30 bg-emerald-50/10 dark:bg-emerald-950/10"
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full",
                  isTrial
                    ? "bg-amber-100 text-amber-600"
                    : "bg-emerald-100 text-emerald-600"
                )}
              >
                {isTrial ? (
                  <CalendarClock className="h-6 w-6" />
                ) : (
                  <Zap className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isTrial ? "Free Trial Active" : "Pro Plan Active"}
                </CardTitle>
                <CardDescription>
                  {isTrial
                    ? "You are enjoying the full Cashocket Pro experience."
                    : "Thanks for being a pro member!"}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "px-3 py-1 text-xs font-bold uppercase tracking-wider",
                isTrial
                  ? "border-amber-500 text-amber-600 bg-amber-100 dark:bg-amber-900/30"
                  : "border-emerald-500 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
              )}
            >
              {isTrial ? "Trialing" : "Active"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-muted-foreground">
                {isTrial ? "Trial Progress" : "Billing Cycle"}
              </span>
              <span className={isTrial ? "text-amber-600" : "text-emerald-600"}>
                {subscription.daysLeft} days remaining
              </span>
            </div>
            <Progress
              value={subscription.progress}
              className={cn(
                "h-3",
                isTrial
                  ? "bg-amber-100 dark:bg-amber-900/20"
                  : "bg-emerald-100 dark:bg-emerald-900/20"
              )}
            />
            <p className="text-xs text-muted-foreground text-right">
              {isTrial ? "Ends on" : "Renews on"}{" "}
              {new Date(subscription.endDate!).toLocaleDateString()}
            </p>
          </div>

          <Separator />

          {/* Features Enabled */}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <FeatureItem text="Unlimited Accounts" active />
            <FeatureItem text="AI Insights" active />
            <FeatureItem text="Custom Categories" active />
            <FeatureItem text="Priority Support" active />
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 p-6 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span>Manage payment method via Stripe</span>
          </div>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL || "#",
                "_blank"
              )
            }
          >
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // --- FREE USER UI ---
  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      {/* Left: Free Plan Card */}
      <Card className="lg:col-span-1 border-border/60 shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <CardDescription>You are on the free starter plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-foreground">
                Free Starter
              </span>
            </div>
            <p className="text-2xl font-bold">
              ₹0
              <span className="text-sm font-normal text-muted-foreground">
                /mo
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Limits:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" /> 2 Accounts Only
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Basic Reports
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Right: Upgrade Card */}
      <Card className="lg:col-span-2 relative border-emerald-500/30 dark:border-emerald-500/50 shadow-xl shadow-emerald-500/5 overflow-hidden">
        <div className="absolute top-0 right-0">
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Recommended
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <h3 className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide uppercase text-sm">
              Cashocket Pro
            </h3>
          </div>
          <CardTitle className="text-3xl font-black">Upgrade to Pro</CardTitle>
          <CardDescription>
            Start your journey with a 3-month free trial.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">₹49</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Billed after 90 days trial.
              </p>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-border mx-2"></div>
            <Badge
              variant="outline"
              className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-sm"
            >
              🎁 3 Months Free
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureItem text="Unlimited Accounts & Wallets" active />
            <FeatureItem text="Advanced Analytics" active />
            <FeatureItem text="Data Export (CSV/PDF)" active />
            <FeatureItem text="Priority Support" active />
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-between gap-4 p-6 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Secure payment via Stripe</span>
          </div>
          <div className="w-full sm:w-auto">
            <SubscriptionButton />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function FeatureItem({
  text,
  active = false,
}: {
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center",
          active
            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Check className="h-3 w-3" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
