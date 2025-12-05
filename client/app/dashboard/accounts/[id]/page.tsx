"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { AccountStats } from "@/components/accounts/account-stats";
import { TransactionFilters } from "@/components/accounts/transaction-filters";
import { TransactionsTable } from "@/components/accounts/transactions-table";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function AccountDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const accountId = unwrappedParams.id;
  
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchDetails = async () => {
    try {
      if(!account) setLoading(true);
      const [accRes, txnRes] = await Promise.all([
        api.get(`/accounts/${accountId}`),
        api.get(`/transactions?accountId=${accountId}`),
      ]);
      setAccount(accRes.data);
      setTransactions(txnRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load account");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [accountId]);

  const handleDeleteAccount = async () => {
    try {
        await api.delete(`/accounts/${accountId}`);
        toast.success("Account deleted");
        router.push("/dashboard/accounts");
    } catch (error) {
        toast.error("Could not delete account");
    }
  };

  // Filter Logic
  const filteredTransactions = transactions
    .filter((txn) => {
      const matchesSearch =
        txn.description?.toLowerCase().includes(search.toLowerCase()) ||
        txn.categoryName?.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || txn.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income" || (t.type === "transfer" && t.toAccountId === accountId))
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense" || (t.type === "transfer" && t.accountId === accountId))
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const renderIcon = (icon: string) => {
    if (icon && (icon.startsWith("data:image") || icon.startsWith("http"))) {
      return <img src={icon} alt="icon" className="h-10 w-10 rounded-lg object-cover bg-muted" />;
    }
    return <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">{icon || "🏦"}</div>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!account) return <div>Account not found</div>;

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Clean Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            {renderIcon(account.icon)}
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {account.name}
              </h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-xs font-normal capitalize"
                >
                  {account.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <TransactionDialog
            account={account}
            onSuccess={fetchDetails}
            trigger={
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Transaction
              </Button>
            }
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Account Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete Account
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <AccountStats
        currentBalance={parseFloat(account.balance)}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Transactions</h2>
          <TransactionFilters
            search={search}
            setSearch={setSearch}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>

        <TransactionsTable
          transactions={filteredTransactions}
          account={account}
          onRefresh={fetchDetails}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{account.name}</strong> and remove all associated data
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}