"use client";

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
import { Check, Zap, ShieldCheck, LayoutDashboard, Clock } from "lucide-react";
import { SubscriptionButton } from "@/components/subscription-button";
import { Button } from "@/components/ui/button";

export function BillingForm({ user }: { user: any }) {
  // Check subscription status from user object (Backend se aayega)
  const isPro =
    user?.subscription?.status === "active" ||
    user?.subscription?.status === "trialing";
  const trialEndsAt = user?.subscription?.trialEnd
    ? new Date(user.subscription.trialEnd)
    : null;

  // Calculate remaining days
  const daysLeft = trialEndsAt
    ? Math.ceil(
        (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  if (isPro) {
    return (
      <Card className="border-emerald-500/50 bg-emerald-50/10 dark:bg-emerald-900/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"
            >
              PRO ACTIVE
            </Badge>
            {user?.subscription?.status === "trialing" && (
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Trial ends in {daysLeft} days
              </span>
            )}
          </div>
          <CardTitle className="text-2xl mt-2">
            You are on the Pro Plan
          </CardTitle>
          <CardDescription>
            Enjoy unlimited accounts, advanced analytics, and priority support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                "https://billing.stripe.com/p/login/YOUR_PORTAL_LINK",
                "_blank"
              )
            }
          >
            Manage Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- FREE USER UI (Upgrade Offer) ---
  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
      {/* Left Side: Current Plan Info (Free) */}
      <Card className="lg:col-span-1 border-border/60 shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
          <CardDescription>You are currently on the free plan.</CardDescription>
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
            <p className="text-sm font-medium">Included:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Basic Expense Tracking
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Monthly Reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" /> 5 Categories
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Right Side: Pro Upgrade Card (Hero) */}
      <Card className="lg:col-span-2 relative border-emerald-500/30 dark:border-emerald-500/50 shadow-xl shadow-emerald-500/5 overflow-hidden">
        {/* Badge */}
        <div className="absolute top-0 right-0">
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
            Recommended
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <h3 className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide uppercase text-sm">
              Cashocket Pro
            </h3>
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-black">
            Upgrade to Pro
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Unlock the full potential of your financial data.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pricing Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">₹49</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Billed monthly after trial ends.
              </p>
            </div>
            <div className="hidden sm:block h-8 w-[1px] bg-border mx-2"></div>
            <Badge
              variant="outline"
              className="border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-sm"
            >
              🎁 3 Months Free Trial
            </Badge>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FeatureItem text="Unlimited Accounts & Wallets" />
            <FeatureItem text="Advanced Analytics & Trends" />
            <FeatureItem text="Custom Categories & Icons" />
            <FeatureItem text="Export Data (CSV/PDF)" />
            <FeatureItem text="Priority Support" />
            <FeatureItem text="No Ads / Watermarks" />
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-muted/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Secure payment via Stripe. Cancel anytime.</span>
          </div>
          <div className="w-full sm:w-auto">
            <SubscriptionButton />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

// Helper
function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}
