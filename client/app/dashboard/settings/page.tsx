"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// Icons
import {
  Check,
  Zap,
  ShieldCheck,
  CreditCard,
  Star,
  LayoutDashboard,
} from "lucide-react";

// Forms & Components
import { ProfileForm } from "@/components/settings/profile-form";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { SubscriptionButton } from "@/components/subscription-button";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/users/profile")
      .then((res) => setUser(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account, preferences, and billing.
        </p>
      </div>
      <Separator className="my-4" />

      {/* Tabs Layout */}
      <Tabs defaultValue="billing" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="general" className="gap-2">
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4" /> Billing & Plans
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- PROFILE TAB --- */}
        <TabsContent value="general" className="animate-in fade-in-50">
          <ProfileForm user={user} />
        </TabsContent>

        {/* --- APPEARANCE TAB --- */}
        <TabsContent value="appearance" className="animate-in fade-in-50">
          <AppearanceForm user={user} />
        </TabsContent>

        {/* --- BILLING TAB (PRO UI) --- */}
        <TabsContent value="billing" className="animate-in fade-in-50">
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            {/* Left Side: Current Plan Info (Free) */}
            <Card className="lg:col-span-1 border-border/60 shadow-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>
                  You are currently on the free plan.
                </CardDescription>
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
                  <span>Secure payment via Razorpay. Cancel anytime.</span>
                </div>
                <div className="w-full sm:w-auto">
                  <SubscriptionButton />
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Component for Feature List
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
