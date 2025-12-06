"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/settings/profile-form";
import { AppearanceForm } from "@/components/settings/appearance-form";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User, Palette } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchProfile = async () => {
    try {
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in-50 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full space-y-6">
        {/* SHADCN STANDARD TABS LOOK */}
        <div className="flex items-center">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2 bg-muted p-1 rounded-lg h-10">
            <TabsTrigger
              value="profile"
              className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center justify-center gap-2 h-full"
            >
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="rounded-md text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center justify-center gap-2 h-full"
            >
              <Palette className="h-4 w-4" /> Appearance
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Content Area */}
        <div className="mt-6">
          <TabsContent
            value="profile"
            className="space-y-4 focus-visible:outline-none"
          >
            {user && <ProfileForm user={user} onUpdate={fetchProfile} />}
          </TabsContent>

          <TabsContent
            value="appearance"
            className="space-y-4 focus-visible:outline-none"
          >
            {user && <AppearanceForm user={user} onUpdate={fetchProfile} />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
