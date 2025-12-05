"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Landmark,
  Wallet,
  Banknote,
  CreditCard,
  MoreVertical,
  Gem, // New Icon for Net Worth
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccountDialog } from "@/components/accounts/account-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mapping Colors to Tailwind Classes
const getGradient = (hexColor: string) => {
  const map: Record<string, string> = {
    "#1e293b": "from-slate-900 to-slate-700",
    "#059669": "from-emerald-600 to-teal-500",
    "#2563eb": "from-blue-600 to-indigo-500",
    "#f97316": "from-orange-500 to-pink-500",
    "#7c3aed": "from-violet-600 to-purple-500",
    "#dc2626": "from-red-600 to-rose-500",
    "#27272a": "from-zinc-800 to-zinc-600",
    "#d97706": "from-yellow-500 to-amber-500",
  };
  return map[hexColor] || "from-blue-600 to-indigo-500";
};

const getIcon = (type: string) => {
  switch (type) {
    case "cash":
      return <Banknote className="h-5 w-5" />;
    case "wallet":
      return <Wallet className="h-5 w-5" />;
    case "card":
      return <CreditCard className="h-5 w-5" />;
    default:
      return <Landmark className="h-5 w-5" />;
  }
};

export default function AccountsPage() {
  const { symbol } = useCurrency();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/accounts/${id}`);
      toast.success("Account deleted");
      fetchAccounts();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Cannot delete account with transactions"
      );
    }
  };

  const filteredAccounts = accounts.filter((acc) =>
    acc.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance),
    0
  );

  return (
    <div className="space-y-8">
      {/* 1. Header & Summary Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Accounts & Wallets
          </h2>
          <p className="text-muted-foreground">
            Manage your bank accounts and cash sources.
          </p>
        </div>

        {/* Updated Net Worth Badge (Violet Theme) */}
        <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-950/30 px-5 py-2.5 rounded-xl border border-violet-100 dark:border-violet-900 shadow-sm">
          <div className="bg-violet-500 rounded-full p-2 text-white shadow-sm ring-2 ring-violet-100 dark:ring-violet-900">
            <Gem className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-violet-600/70 tracking-wider">
              Net Worth
            </p>
            <p className="text-2xl font-bold text-violet-700 dark:text-violet-400 leading-none">
              {symbol}
              {totalBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts..."
            className="pl-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setSelectedAccount(null);
            setOpenDialog(true);
          }}
          className="gap-2 bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
        >
          <Plus className="h-4 w-4" /> Add Account
        </Button>
      </div>

      {/* 3. Accounts Grid (Cards UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((acc) => (
          <div
            key={acc.id}
            className={cn(
              "group relative h-48 rounded-2xl p-6 flex flex-col justify-between text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br",
              getGradient(acc.color)
            )}
          >
            {/* Top Row */}
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md border border-white/10 shadow-sm">
                  {getIcon(acc.type)}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90 text-shadow-sm">
                  {acc.type}
                </span>
              </div>

              {/* Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedAccount(acc);
                      setOpenDialog(true);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure? This will permanently delete{" "}
                          <b>{acc.name}</b> along with its transaction history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(acc.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Bottom Row */}
            <div className="z-10 relative">
              <h3 className="text-lg font-bold truncate tracking-tight opacity-95">
                {acc.name}
              </h3>
              <p className="text-3xl font-mono font-bold mt-0.5 tracking-tight text-shadow-sm">
                <span className="text-2xl mr-1 opacity-80">{symbol}</span>
                {parseFloat(acc.balance).toLocaleString()}
              </p>
            </div>

            {/* Decorative Elements (Glassmorphism Effects) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-tr-full pointer-events-none" />
            <div className="absolute bottom-4 right-4 opacity-10">
              <Landmark className="h-24 w-24" />
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredAccounts.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-4 shadow-sm">
              <Landmark className="h-8 w-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No accounts found
            </h3>
            <p className="max-w-xs mx-auto mt-1">
              Add your first bank account or wallet to start tracking your net
              worth.
            </p>
            <Button
              onClick={() => {
                setSelectedAccount(null);
                setOpenDialog(true);
              }}
              className="mt-6"
              variant="outline"
            >
              Add First Account
            </Button>
          </div>
        )}
      </div>

      <AccountDialog
        open={openDialog}
        setOpen={setOpenDialog}
        account={selectedAccount}
        onSuccess={fetchAccounts}
      />
    </div>
  );
}
