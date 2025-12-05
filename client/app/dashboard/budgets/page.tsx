"use client";

import { useEffect, useState, useRef } from "react"; // useRef notification tracking ke liye
import api from "@/lib/api";
import { BudgetCard } from "@/components/budgets/budget-card";
import { BudgetDialog } from "@/components/budgets/budget-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useCurrency } from "@/context/currency-context";
import { AlertTriangle, PieChart } from "lucide-react";

export default function BudgetsPage() {
  const { symbol } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<any[]>([]);

  // Notification ko baar baar spam hone se rokne ke liye
  const notifiedBudgetsRef = useRef<Set<string>>(new Set());

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (error) {
      console.error("Error fetching budgets", error);
      toast.error("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // --- NOTIFICATION LOGIC ---
  useEffect(() => {
    if (budgets.length > 0) {
      budgets.forEach((budget) => {
        const isExceeded = budget.spent > parseFloat(budget.amount);

        // Agar limit cross hai AUR abhi tak notify nahi kiya hai
        if (isExceeded && !notifiedBudgetsRef.current.has(budget.id)) {
          // Push Notification (Toast)
          toast.error(
            <div className="flex flex-col gap-1">
              <span className="font-bold text-base">
                Budget Limit Exceeded! 🚨
              </span>
              <span className="text-sm">
                You have exceeded your <b>{budget.categoryName}</b> budget by{" "}
                {symbol}{" "}
                {(budget.spent - parseFloat(budget.amount)).toLocaleString()}.
              </span>
            </div>,
            { duration: 5000, position: "top-right" } // Lambe samay tak dikhega
          );

          // Mark as notified taaki refresh par wapas na aaye jab tak user page reload na kare
          notifiedBudgetsRef.current.add(budget.id);
        }
      });
    }
  }, [budgets, symbol]);

  // Calculate Totals for Header
  const totalBudgeted = budgets.reduce(
    (acc, b) => acc + parseFloat(b.amount),
    0
  );
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Keep your spending in check.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Total Budgeted</p>
            <p className="font-bold text-lg">
              {symbol} {totalBudgeted.toLocaleString()}
            </p>
          </div>
          <BudgetDialog onSuccess={fetchBudgets} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}

        {/* Empty State */}
        {budgets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-2xl bg-muted/20">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <PieChart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No budgets set</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              Create a budget for categories like Food or Shopping to track your
              monthly spending limits.
            </p>
            <BudgetDialog onSuccess={fetchBudgets} />
          </div>
        )}
      </div>
    </div>
  );
}
