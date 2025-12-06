"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MoreHorizontal,
  Plus,
  Trash2,
  Pencil,
  ArrowRightLeft,
} from "lucide-react";
import { AccountStats } from "@/components/accounts/account-stats";
import { TransactionFilters } from "@/components/accounts/transaction-filters";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useCurrency } from "@/context/currency-context"; // Symbol ke liye

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function AccountDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const accountId = unwrappedParams.id;

  const { symbol } = useCurrency();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Edit/Delete State for Txn
  const [editingTxn, setEditingTxn] = useState<any>(null);
  const [deletingTxnId, setDeletingTxnId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchDetails = async () => {
    try {
      if (!account) setLoading(true);
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

  const handleDeleteTxn = async () => {
    if (!deletingTxnId) return;
    try {
      await api.delete(`/transactions/${deletingTxnId}`);
      toast.success("Transaction deleted");
      fetchDetails();
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setDeletingTxnId(null);
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
    .filter(
      (t) =>
        t.type === "income" ||
        (t.type === "transfer" && t.toAccountId === accountId)
    )
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const totalExpense = filteredTransactions
    .filter(
      (t) =>
        t.type === "expense" ||
        (t.type === "transfer" && t.accountId === accountId)
    )
    .reduce((acc, t) => acc + parseFloat(t.amount), 0);

  const renderIcon = (icon: string) => {
    if (icon && (icon.startsWith("data:image") || icon.startsWith("http"))) {
      return (
        <img
          src={icon}
          alt="icon"
          className="h-10 w-10 rounded-lg object-cover bg-muted"
        />
      );
    }
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xl">
        {icon || "🏦"}
      </div>
    );
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
      {/* --- HEADER SECTION --- */}
      {/* Mobile: Stacked, Desktop: Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Title & Back Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-3">
            {renderIcon(account.icon)}
            <div>
              <h1 className="text-xl font-bold tracking-tight line-clamp-1">
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

        {/* Actions (Add / Delete) */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none">
            <TransactionDialog
              account={account}
              onSuccess={fetchDetails}
              trigger={
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              }
            />
          </div>

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

      {/* Stats Cards */}
      <AccountStats
        currentBalance={parseFloat(account.balance)}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      {/* --- TRANSACTIONS LIST --- */}
      <div className="space-y-4">
        {/* Filters Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
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

        {/* Responsive Table */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                      {format(new Date(txn.date), "MMM dd")}
                      <div className="text-[10px] text-muted-foreground sm:hidden">
                        {format(new Date(txn.date), "yyyy")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium flex items-center gap-1">
                          {txn.categoryName ||
                            (txn.type === "transfer"
                              ? "Transfer"
                              : "Uncategorized")}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {txn.description ||
                            (txn.type === "transfer"
                              ? txn.toAccountId === accountId
                                ? `From ${txn.accountName}`
                                : `To ${txn.toAccountName}`
                              : "-")}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize text-[10px]",
                          txn.type === "income" &&
                            "text-emerald-600 border-emerald-200 bg-emerald-50",
                          txn.type === "expense" &&
                            "text-red-600 border-red-200 bg-red-50",
                          txn.type === "transfer" &&
                            "text-blue-600 border-blue-200 bg-blue-50"
                        )}
                      >
                        {txn.type}
                      </Badge>
                    </TableCell>

                    <TableCell
                      className={cn(
                        "text-right font-bold",
                        txn.type === "income" ||
                          (txn.type === "transfer" &&
                            txn.toAccountId === accountId)
                          ? "text-emerald-600"
                          : "text-red-600"
                      )}
                    >
                      {txn.type === "income" ||
                      (txn.type === "transfer" && txn.toAccountId === accountId)
                        ? "+"
                        : "-"}
                      {symbol}
                      {parseFloat(txn.amount).toLocaleString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingTxn(txn)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeletingTxnId(txn.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <strong>{account.name}</strong> and remove all associated data.
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

      {/* Delete Transaction Dialog */}
      <AlertDialog
        open={!!deletingTxnId}
        onOpenChange={(open) => !open && setDeletingTxnId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the record and update the account balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTxn}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {editingTxn && (
        <TransactionDialog
          open={!!editingTxn}
          onOpenChange={(open) => !open && setEditingTxn(null)}
          account={account}
          transactionToEdit={editingTxn}
          onSuccess={() => {
            setEditingTxn(null);
            fetchDetails();
          }}
        />
      )}
    </div>
  );
}
