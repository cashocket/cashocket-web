"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  Check,
  Landmark,
  Wallet,
  Banknote,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/context/currency-context";

interface AccountDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  account?: any; // If passed, Edit mode
  onSuccess: () => void;
}

// Professional Gradients for Cards
const CARD_THEMES = [
  { name: "Midnight", class: "from-slate-900 to-slate-700", hex: "#1e293b" },
  { name: "Emerald", class: "from-emerald-600 to-teal-500", hex: "#059669" },
  { name: "Blueberry", class: "from-blue-600 to-indigo-500", hex: "#2563eb" },
  { name: "Sunset", class: "from-orange-500 to-pink-500", hex: "#f97316" },
  { name: "Violet", class: "from-violet-600 to-purple-500", hex: "#7c3aed" },
  { name: "Crimson", class: "from-red-600 to-rose-500", hex: "#dc2626" },
  { name: "Graphite", class: "from-zinc-800 to-zinc-600", hex: "#27272a" },
  { name: "Gold", class: "from-yellow-500 to-amber-500", hex: "#d97706" },
];

export function AccountDialog({
  open,
  setOpen,
  account,
  onSuccess,
}: AccountDialogProps) {
  const { symbol } = useCurrency();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("bank"); // bank, cash, wallet, card
  const [balance, setBalance] = useState("");
  const [theme, setTheme] = useState(CARD_THEMES[2]); // Default Blue

  useEffect(() => {
    if (open) {
      if (account) {
        // Edit Mode
        setName(account.name);
        setType(account.type || "bank");
        setBalance(account.balance.toString());
        // Find theme based on saved color or default
        const savedTheme =
          CARD_THEMES.find((t) => t.hex === account.color) || CARD_THEMES[2];
        setTheme(savedTheme);
      } else {
        // Add Mode
        setName("");
        setType("bank");
        setBalance("");
        setTheme(CARD_THEMES[2]);
      }
    }
  }, [open, account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      type,
      balance: parseFloat(balance),
      color: theme.hex, // Saving HEX to DB
    };

    try {
      if (account) {
        await api.put(`/accounts/${account.id}`, payload);
        toast.success("Account updated successfully");
      } else {
        await api.post("/accounts", payload);
        toast.success("Account created successfully");
      }
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle>
            {account ? "Edit Account" : "Add New Account"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Update account details."
              : "Track a new bank account or wallet."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Live Preview Card */}
          <div
            className={cn(
              "w-full h-32 rounded-xl bg-gradient-to-br shadow-lg flex flex-col justify-between p-5 text-white transition-all duration-300",
              theme.class
            )}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-medium opacity-80 uppercase tracking-wider">
                {type} Account
              </span>
              {type === "bank" && <Landmark className="h-5 w-5 opacity-80" />}
              {type === "cash" && <Banknote className="h-5 w-5 opacity-80" />}
              {type === "wallet" && <Wallet className="h-5 w-5 opacity-80" />}
              {type === "card" && <CreditCard className="h-5 w-5 opacity-80" />}
            </div>
            <div>
              <h4 className="font-bold text-lg truncate">
                {name || "Account Name"}
              </h4>
              <p className="font-mono text-sm opacity-90">
                {symbol} {balance || "0.00"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Account Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. HDFC Bank"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-medium">Current Balance</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {symbol}
              </span>
              <Input
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-8 font-bold"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-medium">Card Theme</Label>
            <div className="flex flex-wrap gap-2">
              {CARD_THEMES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={cn(
                    "h-8 w-8 rounded-full bg-gradient-to-br transition-transform hover:scale-110 flex items-center justify-center",
                    t.class,
                    theme.name === t.name
                      ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110"
                      : ""
                  )}
                >
                  {theme.name === t.name && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {account ? "Update Account" : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
