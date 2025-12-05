"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Loader2, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AppearanceFormProps {
  user: any;
  onUpdate: () => void;
}

export function AppearanceForm({ user, onUpdate }: AppearanceFormProps) {
  const { setCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [currency, setLocalCurrency] = useState(user.currency || "INR");
  const [theme, setTheme] = useState(user.theme || "system");

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

      // Global Context update
      setCurrency(currency);

      // Update local storage
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...savedUser, currency, theme })
      );

      toast.success("Preferences updated successfully!");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance & Preferences</CardTitle>
        <CardDescription>Customize your dashboard experience.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="space-y-6">
          {/* Currency Selection */}
          <div className="grid gap-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={currency} onValueChange={setLocalCurrency}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">🇮🇳 Indian Rupee (₹)</SelectItem>
                <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                <SelectItem value="BDT">🇧🇩 Bangladeshi Taka (৳)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used across all your accounts and transactions.
            </p>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Interface Theme</Label>
            <RadioGroup
              defaultValue={theme}
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              {/* Light */}
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  Light
                </Label>
              </div>

              {/* Dark */}
              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  Dark
                </Label>
              </div>

              {/* System */}
              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-4">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
