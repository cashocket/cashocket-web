"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

interface AppearanceFormProps {
  user: any;
  onUpdate: () => void;
}

export function AppearanceForm({ user, onUpdate }: AppearanceFormProps) {
  const { setTheme: setSystemTheme, theme: currentTheme } = useTheme();
  const { setCurrency } = useCurrency();

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // For hydration fix

  // Local state
  const [currency, setLocalCurrency] = useState(user.currency || "INR");
  const [theme, setLocalTheme] = useState(user.theme || "system");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update local theme state if system theme changes externally
  useEffect(() => {
    if (currentTheme) {
      setLocalTheme(currentTheme);
    }
  }, [currentTheme]);

  const handleThemeChange = (newTheme: string) => {
    setLocalTheme(newTheme);
    setSystemTheme(newTheme); // Immediate effect
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put("/users/profile", {
        name: user.name,
        avatar: user.avatar,
        currency,
        theme,
      });

      setCurrency(currency);

      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...savedUser, currency, theme })
      );

      toast.success("Preferences updated successfully");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <Card className="rounded-lg border shadow-sm">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-semibold">
          Appearance & Preferences
        </CardTitle>
        <CardDescription>
          Customize how Cashocket looks and works for you.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="p-6 pt-0 space-y-8">
          {/* Theme Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Interface Theme</Label>
            {/* FIX: Side by side on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Light */}
              <div
                onClick={() => handleThemeChange("light")}
                className={cn(
                  "cursor-pointer relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                  theme === "light"
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                )}
              >
                <Sun
                  className={cn(
                    "h-6 w-6",
                    theme === "light" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-sm font-medium">Light</span>
                {theme === "light" && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Dark */}
              <div
                onClick={() => handleThemeChange("dark")}
                className={cn(
                  "cursor-pointer relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                  theme === "dark"
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                )}
              >
                <Moon
                  className={cn(
                    "h-6 w-6",
                    theme === "dark" ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="text-sm font-medium">Dark</span>
                {theme === "dark" && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* System */}
              <div
                onClick={() => handleThemeChange("system")}
                className={cn(
                  "cursor-pointer relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                  theme === "system"
                    ? "border-primary bg-primary/5"
                    : "border-muted"
                )}
              >
                <Monitor
                  className={cn(
                    "h-6 w-6",
                    theme === "system"
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <span className="text-sm font-medium">System</span>
                {theme === "system" && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Currency Section */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Default Currency
            </Label>
            <Select value={currency} onValueChange={setLocalCurrency}>
              <SelectTrigger className="w-full h-10 rounded-md bg-background">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              {/* FIX: Added max-h for scrolling */}
              <SelectContent className="max-h-[250px]">
                <SelectItem value="INR">🇮🇳 Indian Rupee (₹)</SelectItem>
                <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                <SelectItem value="GBP">🇬🇧 British Pound (£)</SelectItem>
                <SelectItem value="BDT">🇧🇩 Bangladeshi Taka (৳)</SelectItem>
                <SelectItem value="JPY">🇯🇵 Japanese Yen (¥)</SelectItem>
                <SelectItem value="AUD">🇦🇺 Australian Dollar (A$)</SelectItem>
                <SelectItem value="CAD">🇨🇦 Canadian Dollar (C$)</SelectItem>
                <SelectItem value="CNY">🇨🇳 Chinese Yuan (¥)</SelectItem>
                <SelectItem value="PKR">🇵🇰 Pakistani Rupee (₨)</SelectItem>
                <SelectItem value="RUB">🇷🇺 Russian Ruble (₽)</SelectItem>
                <SelectItem value="AED">🇦🇪 UAE Dirham (د.إ)</SelectItem>
                <SelectItem value="SAR">🇸🇦 Saudi Riyal (﷼)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[13px] text-muted-foreground pt-1">
              This currency symbol will be displayed throughout your dashboard.
            </p>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end rounded-b-lg">
          <Button type="submit" disabled={loading} className="min-w-[100px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
