"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface BudgetCardProps {
  budget: any;
}

export function BudgetCard({ budget }: BudgetCardProps) {
  const { symbol } = useCurrency();
  const percentage = Math.min(budget.percentage, 100); // Visual max 100%
  const isExceeded = budget.spent > parseFloat(budget.amount);
  const remaining = Math.max(parseFloat(budget.amount) - budget.spent, 0);

  // Color Logic
  let progressColor = "bg-emerald-500";
  let statusColor = "text-emerald-600";

  if (isExceeded) {
    progressColor = "bg-red-500";
    statusColor = "text-red-600";
  } else if (budget.percentage > 80) {
    progressColor = "bg-amber-500";
    statusColor = "text-amber-600";
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        isExceeded
          ? "border-red-200 bg-red-50/10 dark:border-red-900/50"
          : "hover:border-primary/50"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl">
            {budget.categoryIcon || "🏷️"}
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {budget.categoryName}
            </CardTitle>
            <p className="text-xs text-muted-foreground">Monthly Limit</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold">
            {symbol} {parseFloat(budget.amount).toLocaleString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Progress Bar with Custom Indicator Color */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className={statusColor}>
              {budget.percentage.toFixed(0)}% Used
            </span>
            <span className="text-muted-foreground">
              {symbol} {budget.spent.toLocaleString()} spent
            </span>
          </div>

          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-in-out",
                progressColor
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Footer Status */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-xs">
          {isExceeded ? (
            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span>
                Over Budget by {symbol}{" "}
                {(budget.spent - parseFloat(budget.amount)).toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>
                {symbol} {remaining.toLocaleString()} remaining
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
