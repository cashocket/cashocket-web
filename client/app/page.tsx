"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryIconView } from "@/components/category-icon-view";
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Plus,
  PieChart, // FIX: Added missing import
} from "lucide-react";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { Separator } from "@/components/ui/separator";
import { useCurrency } from "@/context/currency-context";

export default function DashboardPage() {
  const { symbol } = useCurrency(); // Use currency from context
  const [summary, setSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
  });
  const [recentTxns, setRecentTxns] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [summaryRes, txnRes] = await Promise.all([
        api.get("/accounts/summary"),
        api.get("/transactions"),
      ]);
      setSummary(summaryRes.data);
      setRecentTxns(txnRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 relative">
      {/* Decorative Gradient Blob (Optional) */}
      <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-normal" />

      {/* Top Section: Greeting & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Here is an overview of your financial health.
          </p>
        </div>
        <div className="flex gap-2">
          <AddTransactionDialog defaultType="income" onSuccess={fetchData} />
          <AddTransactionDialog defaultType="expense" onSuccess={fetchData} />
        </div>
      </div>

      <Separator className="bg-border/60" />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Balance
            </CardTitle>
            <span className="text-muted-foreground font-serif italic text-lg">
              {symbol}
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter">
              {symbol}
              {summary.totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{symbol}
              {summary.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Recorded this month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none border border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expense
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              -{symbol}
              {summary.totalExpense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Spending this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">
        {/* Placeholder for future Chart */}
        <Card className="col-span-4 shadow-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>
              Income vs Expense over time (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <PieChart className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Chart visualization will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 shadow-none border border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your last 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTxns.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="relative">
                      {txn.type === "transfer" ? (
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                          <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      ) : (
                        <CategoryIconView
                          icon={txn.categoryIcon}
                          color={txn.categoryColor}
                        />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {txn.type === "transfer"
                          ? `To ${txn.toAccountName}`
                          : txn.categoryName || "Uncategorized"}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <span>{format(new Date(txn.date), "MMM d")}</span>
                        <span>•</span>
                        <span>
                          {txn.description ||
                            (txn.type === "transfer" ? "Transfer" : "N/A")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`text-sm font-bold ${
                      txn.type === "income"
                        ? "text-emerald-600"
                        : txn.type === "expense"
                        ? "text-rose-600"
                        : "text-foreground"
                    }`}
                  >
                    {txn.type === "income" ? "+" : "-"}
                    {symbol}
                    {txn.amount}
                  </div>
                </div>
              ))}

              {recentTxns.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No recent activity.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
