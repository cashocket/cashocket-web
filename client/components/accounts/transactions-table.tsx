"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Updated Import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { TransactionDialog } from "@/components/transactions/transaction-dialog";
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
import api from "@/lib/api";
import { toast } from "sonner";

interface TransactionsTableProps {
  transactions: any[];
  account: any;
  onRefresh: () => void;
}

export function TransactionsTable({
  transactions,
  account,
  onRefresh,
}: TransactionsTableProps) {
  const { symbol } = useCurrency();
  const [editingTxn, setEditingTxn] = useState<any>(null);
  const [deletingTxnId, setDeletingTxnId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deletingTxnId) return;
    try {
      await api.delete(`/transactions/${deletingTxnId}`);
      toast.success("Transaction deleted");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setDeletingTxnId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
          <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No transactions yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-2">
          Start by adding a new transaction to track your income and expenses.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[150px]">Date</TableHead>
              <TableHead>Category / Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[80px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((txn) => (
              <TableRow key={txn.id}>
                <TableCell className="font-medium">
                  {new Date(txn.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium flex items-center gap-2">
                      {txn.categoryName ? (
                        <>
                          <span className="text-base">{txn.categoryIcon}</span>
                          {txn.categoryName}
                        </>
                      ) : (
                        <>
                          {txn.type === "transfer" ? (
                            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            "📝"
                          )}
                          {txn.description || "No Description"}
                        </>
                      )}
                    </span>
                    {txn.categoryName && txn.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {txn.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      txn.type === "income" &&
                        "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-500/20",
                      txn.type === "expense" &&
                        "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-900/20 dark:text-rose-400 dark:ring-rose-500/20",
                      txn.type === "transfer" &&
                        "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/20 dark:text-blue-400 dark:ring-blue-500/20"
                    )}
                  >
                    {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-bold text-base",
                    txn.type === "income"
                      ? "text-emerald-600"
                      : txn.type === "expense"
                      ? "text-rose-600"
                      : "text-blue-600"
                  )}
                >
                  {txn.type === "income" ? "+" : "-"} {symbol}{" "}
                  {parseFloat(txn.amount).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditingTxn(txn)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Modal Reuse */}
      {editingTxn && (
        <TransactionDialog
          open={!!editingTxn}
          onOpenChange={(open) => !open && setEditingTxn(null)}
          account={account}
          transactionToEdit={editingTxn}
          onSuccess={() => {
            setEditingTxn(null);
            onRefresh();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTxnId}
        onOpenChange={(open) => !open && setDeletingTxnId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this transaction record and revert
              the balance changes from <strong>{account?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
