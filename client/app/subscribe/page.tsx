"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { SubscriptionButton } from "@/components/subscription-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, ShieldCheck, Wallet, LogOut, Loader2 } from "lucide-react";

export default function SubscribePage() {
  const { user, subscription, loading } = useUser();
  const router = useRouter();

  // Agar user already subscribed hai, toh dashboard bhej do
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
      <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      {/* Header / Logo */}
      <div className="mb-8 flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2 font-black text-3xl tracking-tighter">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl">
            <Wallet className="h-6 w-6" />
          </div>
          <span>Cashocket</span>
        </div>
        <p className="text-muted-foreground">
          Complete your setup to continue.
        </p>
      </div>

      <Card className="w-full max-w-lg border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
        <div className="bg-emerald-500/10 p-4 text-center border-b border-emerald-500/20">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm tracking-wide uppercase">
            Special Welcome Offer
          </span>
        </div>

        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black">
            3 Months Free Trial
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Experience the full power of Cashocket Pro. <br />
            <span className="font-medium text-foreground">₹0 today</span>, then
            just ₹49/month.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Benefits List */}
          <div className="grid gap-3">
            {[
              "Unlimited Accounts & Wallets",
              "Advanced AI Analytics",
              "Data Export (CSV/PDF)",
              "Cancel Anytime (No commitment)",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-xl text-xs text-muted-foreground space-y-2">
            <p>
              <strong>How it works:</strong> You will be redirected to Stripe to
              securely set up your subscription. You won't be charged today.
            </p>
            <p>
              Your first charge of <strong>₹49</strong> will happen
              automatically after 3 months unless you cancel before the trial
              ends.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 bg-muted/20 p-6">
          <SubscriptionButton />

          <div className="flex items-center justify-between w-full mt-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Secure Payment via Stripe
            </div>
            <Button
              variant="link"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive h-auto p-0 text-xs"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
