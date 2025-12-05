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
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Trash2,
  ArrowRightLeft,
  CalendarDays,
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
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-900">
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">
            Transfer History
          </h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transfers..."
              className="pl-9 h-9 bg-white dark:bg-zinc-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3">
          {filteredTransfers.map((txn) => (
            <Card
              key={txn.id}
              className="group hover:shadow-md transition-all border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                      <span>{txn.accountName}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{txn.toAccountName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {txn.description || "Fund Transfer"}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/70">
                      <CalendarDays className="h-3 w-3" />
                      <span>{format(new Date(txn.date), "PPP • p")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-foreground">
                    <span className="text-muted-foreground font-normal text-xs mr-0.5">
                      {symbol}
                    </span>
                    {txn.amount}
                  </span>

                  {/* UX FIX: Opacity Logic Updated */}
                  <div className="flex gap-1 opacity-100 sm:opacity-60 sm:hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
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
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revert Transfer?</AlertDialogTitle>
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
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTransfers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="bg-muted/50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                <ArrowRightLeft className="h-6 w-6 opacity-50" />
              </div>
              <p>No transfers found for this period.</p>
            </div>
          )}
        </div>
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
