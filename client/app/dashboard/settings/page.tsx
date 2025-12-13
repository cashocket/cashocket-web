"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";

// Icons
import { CreditCard, User, Palette } from "lucide-react";

// Components
import { ProfileForm } from "@/components/settings/profile-form";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { BillingForm } from "@/components/settings/billing-form";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh user data after update
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      setUser(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" /> Appearance
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
            >
              <CreditCard className="h-4 w-4" /> Billing & Plans
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- PROFILE TAB (Needs User Prop) --- */}
        <TabsContent value="general" className="animate-in fade-in-50">
          <ProfileForm user={user} onUpdate={fetchProfile} />
        </TabsContent>

        {/* --- APPEARANCE TAB (Needs User Prop) --- */}
        <TabsContent value="appearance" className="animate-in fade-in-50">
          <AppearanceForm user={user} onUpdate={fetchProfile} />
        </TabsContent>

        {/* --- BILLING TAB (Self-contained, NO Prop needed) --- */}
        <TabsContent value="billing" className="animate-in fade-in-50">
          {/* FIX: Removed 'user={user}' because BillingForm uses useUser hook now */}
          <BillingForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
