"use client";

import { useCurrency } from "@/context/currency-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryIconView } from "@/components/category-icon-view";
import { format } from "date-fns";
import { ArrowRightLeft } from "lucide-react";

interface RecentTransactionsProps {
  transactions: any[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { symbol } = useCurrency();

  const TransactionList = ({ data }: { data: any[] }) => (
    <div className="space-y-4">
      {data.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No transactions found.
        </p>
      ) : (
        data.map((txn) => (
          <div
            key={txn.id}
            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
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
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {txn.type === "transfer"
                    ? `To ${txn.toAccountName}`
                    : txn.categoryName || "Uncategorized"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(txn.date), "PPP")} •{" "}
                  {txn.description || "No desc"}
                </p>
              </div>
            </div>
            <div
              className={`font-bold text-sm ${
                txn.type === "income"
                  ? "text-emerald-600"
                  : txn.type === "expense"
                  ? "text-red-600"
                  : "text-foreground"
              }`}
            >
              {txn.type === "income" ? "+" : "-"}
              {symbol}
              {txn.amount}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className="col-span-7 shadow-sm">
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Recent financial activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expense">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <TransactionList data={transactions.slice(0, 5)} />
          </TabsContent>
          <TabsContent value="income">
            <TransactionList
              data={transactions.filter((t) => t.type === "income").slice(0, 5)}
            />
          </TabsContent>
          <TabsContent value="expense">
            <TransactionList
              data={transactions
                .filter((t) => t.type === "expense")
                .slice(0, 5)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
