"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

interface AccountStatsProps {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export function AccountStats({
  currentBalance,
  totalIncome,
  totalExpense,
}: AccountStatsProps) {
  const { symbol } = useCurrency();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Current Balance */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <p className="text-sm font-medium text-muted-foreground">
              Available Balance
            </p>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {symbol} {currentBalance.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Income */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <p className="text-sm font-medium text-muted-foreground">
              Total Income
            </p>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {symbol} {totalIncome.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expense */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0">
            <p className="text-sm font-medium text-muted-foreground">
              Total Expense
            </p>
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10">
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {symbol} {totalExpense.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
