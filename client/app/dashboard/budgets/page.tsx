"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AddBudgetDialog } from "@/components/add-budget-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { CategoryIconView } from "@/components/category-icon-view";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-violet-600">
            Budgets
          </h2>
          <p className="text-muted-foreground">Set limits and save more.</p>
        </div>
        <AddBudgetDialog onSuccess={fetchBudgets} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => {
          const isOverBudget = budget.percentage >= 100;
          const statusColor = isOverBudget
            ? "bg-red-500"
            : budget.percentage > 80
            ? "bg-orange-500"
            : "bg-primary";

          return (
            <Card
              key={budget.id}
              className="rounded-[2rem] border-none shadow-sm overflow-hidden"
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CategoryIconView
                    icon={budget.categoryIcon}
                    color={budget.categoryColor}
                    className="h-10 w-10 text-lg"
                  />
                  <div>
                    <CardTitle className="text-base">
                      {budget.categoryName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Monthly Limit
                    </p>
                  </div>
                </div>
                {isOverBudget ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className={isOverBudget ? "text-red-500" : ""}>
                    ₹{budget.spent.toLocaleString()} spent
                  </span>
                  <span className="text-muted-foreground">
                    of ₹{parseFloat(budget.amount).toLocaleString()}
                  </span>
                </div>

                <Progress
                  value={budget.percentage}
                  className="h-3 bg-muted"
                  indicatorClassName={statusColor}
                />

                <p className="text-xs text-muted-foreground mt-3 text-right">
                  {isOverBudget
                    ? "Limit Exceeded!"
                    : `${(100 - budget.percentage).toFixed(0)}% remaining`}
                </p>
              </CardContent>
            </Card>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-[2rem] bg-muted/10">
            <p className="text-muted-foreground">
              No budgets set. Create one to start tracking!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
