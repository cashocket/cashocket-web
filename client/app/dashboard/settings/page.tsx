"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";

// Forms
import { ProfileForm } from "@/components/settings/profile-form";
import { AppearanceForm } from "@/components/settings/appearance-form";
// New Import
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

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger> {/* New Tab */}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="general">
          <ProfileForm user={user} />
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <AppearanceForm user={user} />
        </TabsContent>

        {/* Billing Tab (New) */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your billing and subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 dark:bg-zinc-900/50">
                <div>
                  <h4 className="font-semibold text-base">Cashocket Pro</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    First 3 months{" "}
                    <span className="text-emerald-600 font-bold">FREE</span>,
                    then ₹49/month.
                  </p>
                  <ul className="text-xs text-muted-foreground mt-3 space-y-1 list-disc list-inside">
                    <li>Unlimited Accounts & Categories</li>
                    <li>Export to CSV/PDF (Coming Soon)</li>
                    <li>Priority Support</li>
                  </ul>
                </div>
                <div className="w-full sm:w-auto">
                  <SubscriptionButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
