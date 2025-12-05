"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import { useTheme } from "next-themes"; // Theme Hook
import { toast } from "sonner";
import { Loader2, Save, Globe, Moon, Sun, Laptop } from "lucide-react";
import { currencies } from "@/lib/currencies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { currency, setCurrency } = useCurrency();
  const { setTheme, theme } = useTheme(); // Theme Logic

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    currency: currency,
  });

  // Load User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/profile");
        setProfile({
          name: res.data.name,
          email: res.data.email,
          currency: res.data.currency || "INR",
        });
      } catch (error) {
        toast.error("Failed to load settings");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile", {
        name: profile.name,
        currency: profile.currency,
        theme: theme, // Save theme preference to DB too if needed
      });

      // Update Global Context
      setCurrency(profile.currency);

      toast.success("Settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Settings</h3>
        <p className="text-muted-foreground">
          Manage your account preferences and appearance.
        </p>
      </div>
      <Separator />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: GENERAL (Profile & Currency) --- */}
        <TabsContent value="general" className="mt-6">
          <form onSubmit={handleUpdate}>
            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle>Profile & Currency</CardTitle>
                <CardDescription>
                  Update your personal details and default currency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="max-w-md h-10"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="max-w-md h-10 bg-muted text-muted-foreground"
                  />
                </div>

                {/* Currency Selector */}
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <div className="max-w-md">
                    <Select
                      value={profile.currency}
                      onValueChange={(val) =>
                        setProfile({ ...profile, currency: val })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {currencies.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold w-6 text-center text-muted-foreground bg-muted/50 rounded text-xs py-0.5">
                                {c.symbol}
                              </span>
                              <span>
                                {c.name} ({c.code})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    This symbol will be used across your dashboard.
                  </p>
                </div>
              </CardContent>

              <div className="p-6 border-t bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-end">
                <Button type="submit" disabled={loading} className="gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>
        </TabsContent>

        {/* --- TAB 2: APPEARANCE (Theme Selection) --- */}
        <TabsContent value="appearance" className="mt-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application. Automatically
                switch between day and night themes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label className="text-base">Theme</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the theme for the dashboard.
                </p>

                <div className="grid max-w-3xl grid-cols-1 gap-8 md:grid-cols-3">
                  {/* Light Mode Card */}
                  <div
                    onClick={() => setTheme("light")}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "items-center rounded-md border-2 border-muted p-1 hover:border-accent",
                        theme === "light" && "border-primary"
                      )}
                    >
                      <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                          <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Sun className="h-4 w-4 text-muted-foreground" />
                      <span className="block w-full p-2 text-center font-normal">
                        Light
                      </span>
                    </div>
                  </div>

                  {/* Dark Mode Card */}
                  <div
                    onClick={() => setTheme("dark")}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground",
                        theme === "dark" && "border-primary"
                      )}
                    >
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Moon className="h-4 w-4 text-muted-foreground" />
                      <span className="block w-full p-2 text-center font-normal">
                        Dark
                      </span>
                    </div>
                  </div>

                  {/* System Mode Card */}
                  <div
                    onClick={() => setTheme("system")}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground",
                        theme === "system" && "border-primary"
                      )}
                    >
                      <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                        <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                          <div className="h-4 w-4 rounded-full bg-slate-400" />
                          <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-muted-foreground" />
                      <span className="block w-full p-2 text-center font-normal">
                        System
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
