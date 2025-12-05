"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      // Background refresh ke liye loading true mat karo agar data already hai
      if (!user) setLoading(true);
      const res = await api.get("/users/profile");
      setUser(res.data);
    } catch (error) {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading && !user) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account profile and application preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="space-y-4">
            {user && <ProfileForm user={user} onUpdate={fetchProfile} />}
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            {user && <AppearanceForm user={user} onUpdate={fetchProfile} />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
