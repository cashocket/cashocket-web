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

// Components Imports
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { ExpenseTrendChart } from "@/components/expenses/expense-trend-chart";
import { ExpenseCategoryChart } from "@/components/expenses/expense-category-chart";
import { CategoryIconView } from "@/components/category-icon-view";

// UI Imports
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Pencil, TrendingDown } from "lucide-react";
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

export default function ExpensesPage() {
  const { symbol } = useCurrency();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  // --- FILTER STATE ---
  const [filter, setFilter] = useState<
    "today" | "weekly" | "monthly" | "custom"
  >("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/transactions?type=expense");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Expense deleted");
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // --- FILTER LOGIC ---
  const filteredExpenses = expenses.filter((exp) => {
    // 1. Search
    const matchesSearch =
      exp.description?.toLowerCase().includes(search.toLowerCase()) ||
      exp.categoryName?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Date
    const txnDate = new Date(exp.date);
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

  const totalExpense = filteredExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Expense Analytics
          </h2>
          <p className="text-muted-foreground">
            Analyze your spending habits and patterns.
          </p>
        </div>
        <AddTransactionDialog defaultType="expense" onSuccess={fetchExpenses} />
      </div>

      {/* 2. Global Filter Bar & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardFilters
          filter={filter}
          setFilter={setFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Total Expense Badge (Red Style) */}
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 px-4 py-2 rounded-lg border border-red-100 dark:border-red-900 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="bg-red-500 rounded-full p-1.5 text-white shadow-sm">
            <TrendingDown className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-red-600/70 tracking-wider">
              Total Spent
            </p>
            <p className="text-xl font-bold text-red-700 dark:text-red-400 leading-none">
              {symbol}
              {totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Trend Chart (Takes 2 cols) */}
        <div className="md:col-span-2">
          <ExpenseTrendChart data={filteredExpenses} />
        </div>
        {/* Category Chart (Takes 1 col) */}
        <div className="md:col-span-1">
          <ExpenseCategoryChart data={filteredExpenses} />
        </div>
      </div>

      {/* 4. Transactions List */}
      <div className="space-y-4">
        {/* Header & Search Bar - Mobile Responsive Stack */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight">
            Recent Expenses
          </h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
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
                <TableHead>Category</TableHead>
                <TableHead className="hidden sm:table-cell">Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">
                      {format(new Date(exp.date), "MMM dd, yyyy")}
                      <div className="text-[10px] text-muted-foreground sm:hidden">
                        {format(new Date(exp.date), "p")}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CategoryIconView
                          icon={exp.categoryIcon}
                          color={exp.categoryColor}
                          className="h-8 w-8 text-xs"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {exp.categoryName}
                          </span>
                          {/* Mobile Account Display */}
                          <span className="text-[10px] text-muted-foreground sm:hidden">
                            {exp.accountName}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {exp.accountName}
                    </TableCell>

                    <TableCell className="text-right font-bold text-red-600">
                      -{symbol}
                      {exp.amount}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-primary"
                          onClick={() => {
                            setSelectedTxn(exp);
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
                                Delete Expense?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove the transaction and refund{" "}
                                {symbol}
                                {exp.amount} to {exp.accountName}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(exp.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
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
                    No expense records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* --- SHADCN TABLE END --- */}
      </div>

      <EditTransactionDialog
        open={editOpen}
        setOpen={setEditOpen}
        transaction={selectedTxn}
        onSuccess={() => {
          fetchExpenses();
          setEditOpen(false);
        }}
      />
    </div>
  );
}
