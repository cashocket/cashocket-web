"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { SubscriptionButton } from "@/components/subscription-button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ShieldCheck,
  Wallet,
  LogOut,
  Loader2,
  Sparkles,
  Zap,
  TrendingUp,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubscribePage() {
  const { subscription, loading } = useUser();
  const router = useRouter();

  // Redirect if already active
  useEffect(() => {
    if (
      !loading &&
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing")
    ) {
      router.replace("/dashboard");
    }
  }, [subscription, loading, router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Verifying access...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden p-4 md:p-8">
      {/* Background Decor: Gradients & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* LEFT SIDE: Value Proposition (Hero) */}
        <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-4 w-4 fill-current" />
              <span>Zero Friction Finance</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              The last expense tracker <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
                you will ever need.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0">
              Spreadsheets are boring and banking apps are confusing. Cashocket
              is built for <strong className="text-foreground">you</strong>.
              Effortless tracking, powerful insights, and total control over
              your wallet—in seconds.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-left">
            <FeatureCard
              icon={TrendingUp}
              title="Smart Analytics"
              desc="Visualize spending habits instantly."
            />
            <FeatureCard
              icon={Wallet}
              title="Unlimited Wallets"
              desc="Manage multiple accounts in one place."
            />
            <FeatureCard
              icon={Lock}
              title="Bank-Grade Security"
              desc="Your financial data is encrypted & safe."
            />
            <FeatureCard
              icon={Zap}
              title="AI Insights"
              desc="Get personalized saving tips automatically."
            />
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-zinc-200 dark:bg-zinc-800"
                />
              ))}
            </div>
            <p>
              Trusted by{" "}
              <span className="font-bold text-foreground">1,000+</span>{" "}
              proactive savers.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Payment Card */}
        <div className="order-1 lg:order-2 w-full max-w-md mx-auto">
          <Card className="border-emerald-500/20 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm bg-background/80 relative overflow-hidden">
            {/* Top Ribbon */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <CardHeader className="text-center space-y-2 pb-2 pt-8">
              <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-2 rotate-3 hover:rotate-6 transition-transform">
                <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">Start your 3-Month Trial</h2>
              <p className="text-muted-foreground">
                No commitment. Cancel anytime.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Pricing Box */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-center space-y-1 relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 hover:bg-emerald-700">
                  100% FREE for 90 Days
                </Badge>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="text-muted-foreground line-through text-lg">
                    ₹147
                  </span>
                  <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                    ₹0
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  Then ₹49/mo after trial ends.
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-3 relative pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-background" />
                  <p className="text-sm font-semibold">
                    Today: Start Free Trial
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Unlock full Pro access instantly.
                  </p>
                </div>
                <div className="relative pt-4">
                  <div className="absolute -left-[21px] top-5 h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-background" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Day 90
                  </p>
                  <p className="text-xs text-muted-foreground">
                    First charge of ₹49 (only if not canceled).
                  </p>
                </div>
              </div>

              <Separator />

              {/* Action */}
              <div className="space-y-3">
                <SubscriptionButton />
                <p className="text-[10px] text-center text-muted-foreground">
                  By subscribing, you agree to our Terms. Payment is secured by
                  Stripe.
                </p>
              </div>
            </CardContent>

            <CardFooter className="bg-zinc-50/50 dark:bg-zinc-900/30 p-4 flex justify-between items-center border-t">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-medium text-muted-foreground">
                  SSL Encrypted
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3 w-3 mr-1" />
                Log out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Mini Component for Features
function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
      <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}
