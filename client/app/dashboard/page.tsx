"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useCurrency } from "@/context/currency-context";
import {
  isSameDay,
  subDays,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";
import { DateRange } from "react-day-picker";

// Components
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { CategoryPie } from "@/components/dashboard/category-pie";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { AddTransferDialog } from "@/components/add-transfer-dialog";

export default function DashboardPage() {
  const { symbol } = useCurrency();
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);

  // Filters State
  const [filter, setFilter] = useState<
    "today" | "weekly" | "monthly" | "custom"
  >("monthly");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const fetchData = async () => {
    try {
      // Fetch ALL transactions to filter client side
      const res = await api.get("/transactions");
      setAllTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Logic (Runs whenever filter/dateRange/data changes)
  useEffect(() => {
    const today = new Date();

    const filtered = allTransactions.filter((txn) => {
      const txnDate = new Date(txn.date);

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

    setFilteredTransactions(filtered);
  }, [allTransactions, filter, dateRange]);

  // Calculate Stats based on FILTERED data
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  // Cash Flow calculation
  const cashFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* --- Top Header: Title --- */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Financial overview for the selected period.
        </p>
      </div>

      {/* --- Controls Toolbar (Filters & Actions) --- */}
      {/* Mobile: Column layout (Stack), Desktop: Row layout (Side by side) */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
        {/* Filters */}
        <DashboardFilters
          filter={filter}
          setFilter={setFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        {/* Action Buttons Group */}
        {/* Mobile: Grid (2 cols for buttons, Transfer full width) */}
        {/* Desktop: Flex row (All in one line) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <AddTransactionDialog onSuccess={fetchData} defaultType="income" />
          <AddTransactionDialog onSuccess={fetchData} defaultType="expense" />

          {/* Transfer Button wrapper for responsiveness */}
          <div className="col-span-2 sm:col-span-1">
            <AddTransferDialog onSuccess={fetchData} />
          </div>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Cash Flow Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash Flow
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                cashFlow >= 0 ? "text-foreground" : "text-red-600"
              }`}
            >
              {cashFlow < 0 && "-"}
              {symbol}
              {Math.abs(cashFlow).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net flow for this period
            </p>
          </CardContent>
        </Card>

        {/* Income Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              +{symbol}
              {totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expense
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              -{symbol}
              {totalExpense.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Charts Section --- */}
      {/* Mobile: Stacked, Desktop: Side-by-side */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
        <OverviewChart data={filteredTransactions} />
        <CategoryPie transactions={filteredTransactions} />
      </div>

      {/* --- Recent Transactions Table --- */}
      <div className="grid gap-4 grid-cols-1">
        <RecentTransactions transactions={filteredTransactions} />
      </div>
    </div>
  );
}
