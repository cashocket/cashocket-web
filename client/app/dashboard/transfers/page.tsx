"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  format,
  isSameDay,
  subDays,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { useCurrency } from "@/context/currency-context";
import { DateRange } from "react-day-picker";

// Components
import { AddTransferDialog } from "@/components/add-transfer-dialog";
import { EditTransferDialog } from "@/components/edit-transfer-dialog";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { TransferTrendChart } from "@/components/transfers/transfer-trend-chart";
import { TransferAccountsChart } from "@/components/transfers/transfer-accounts-chart";

// UI Imports
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Trash2,
  ArrowRightLeft,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransfersPage() {
  const { symbol } = useCurrency();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  // --- FILTERS STATE ---
  const [filter, setFilter] = useState<
    "today" | "weekly" | "monthly" | "custom"
  >("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchTransfers = async () => {
    try {
      const res = await api.get("/transactions?type=transfer");
      setTransfers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transfer reversed & deleted");
      fetchTransfers();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // --- FILTER LOGIC ---
  const filteredTransfers = transfers.filter((t) => {
    // 1. Search
    const matchesSearch =
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.accountName?.toLowerCase().includes(search.toLowerCase()) ||
      t.toAccountName?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Date
    const txnDate = new Date(t.date);
    const today = new Date();

    if (filter === "today") return isSameDay(txnDate, today);
    if (filter === "weekly")
      return isWithinInterval(txnDate, {
        start: subDays(startOfDay(today), 6),
        end: endOfDay(today),
      });
    if (filter === "monthly")
      return isWithinInterval(txnDate, {
        start: startOfMonth(today),
        end: endOfMonth(today),
      });
    if (filter === "custom") {
      if (dateRange?.from && dateRange?.to) {
        return isWithinInterval(txnDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      } else if (dateRange?.from) {
        return isSameDay(txnDate, dateRange.from);
      }
      return true;
    }
    return true;
  });

  const totalTransferred = filteredTransfers.reduce(
    (sum, t) => sum + parseFloat(t.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Internal Transfers
          </h2>
          <p className="text-muted-foreground">
            Monitor fund movements between accounts.
          </p>
        </div>
        <AddTransferDialog onSuccess={fetchTransfers} />
      </div>

      {/* 2. Global Filter Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardFilters
          filter={filter}
          setFilter={setFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Total Badge (Blue) */}
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="bg-blue-500 rounded-full p-1.5 text-white shadow-sm">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-600/70 tracking-wider">
              Moved
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-400 leading-none">
              {symbol}
              {totalTransferred.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <TransferTrendChart data={filteredTransfers} />
        </div>
        <div className="md:col-span-1">
          <TransferAccountsChart data={filteredTransfers} />
        </div>
      </div>

      {/* 4. List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            Transfer History
          </h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfers..."
              className="pl-9 h-9 bg-white dark:bg-zinc-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* --- SHADCN TABLE START --- */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead>From Account</TableHead>
                <TableHead className="hidden sm:table-cell">
                  To Account
                </TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                      {format(new Date(txn.date), "MMM dd, yyyy")}
                      <div className="text-[10px] text-muted-foreground sm:hidden">
                        {format(new Date(txn.date), "p")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {txn.accountName}
                        </span>
                        {/* Mobile View: Arrow -> To Account */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:hidden mt-0.5">
                          <ArrowRight className="h-3 w-3" />
                          <span>{txn.toAccountName}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-sm">
                      {txn.toAccountName}
                    </TableCell>

                    <TableCell className="text-right font-bold text-blue-600">
                      {symbol}
                      {txn.amount}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary"
                          onClick={() => {
                            setSelectedTransfer(txn);
                            setEditOpen(true);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revert Transfer?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will move {symbol}
                                {txn.amount} back from {txn.toAccountName} to{" "}
                                {txn.accountName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(txn.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Revert
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transfer history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* --- SHADCN TABLE END --- */}
      </div>

      <EditTransferDialog
        open={editOpen}
        setOpen={setEditOpen}
        transfer={selectedTransfer}
        onSuccess={fetchTransfers}
      />
    </div>
  );
}
