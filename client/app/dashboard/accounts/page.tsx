"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AccountCard } from "@/components/accounts/account-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Add Account Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountType, setNewAccountType] = useState("bank");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts");
      setAccounts(res.data);
    } catch (error) {
      console.error("Error fetching accounts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post("/accounts", {
        name: newAccountName,
        type: newAccountType,
        balance: newAccountBalance,
        color: "#000000",
        icon:
          newAccountType === "bank"
            ? "🏦"
            : newAccountType === "wallet"
            ? "👛"
            : "💵",
      });
      toast.success("Account created successfully");
      setIsAddOpen(false);
      setNewAccountName("");
      setNewAccountBalance("");
      fetchAccounts();
    } catch (error: any) {
      toast.error("Failed to create account");
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods and balances.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Account</DialogTitle>
              <DialogDescription>
                Add a new source of funds to track.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAccount} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. HDFC Bank"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newAccountType}
                    onValueChange={setNewAccountType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="balance">Balance</Label>
                  <Input
                    id="balance"
                    type="number"
                    placeholder="0.00"
                    value={newAccountBalance}
                    onChange={(e) => setNewAccountBalance(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={createLoading} className="mt-2">
                {createLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Account
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}

        {accounts.length === 0 && (
          <div className="col-span-full flex h-48 flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20">
            <p className="text-muted-foreground">No accounts found</p>
            <Button variant="link" onClick={() => setIsAddOpen(true)}>
              Create one now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
