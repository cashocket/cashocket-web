"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // useParams ID lene ke liye
import api from "@/lib/api";
import { format } from "date-fns";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryIconView } from "@/components/category-icon-view";
import { useCurrency } from "@/context/currency-context";

export default function AccountDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params?.id as string;

  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { symbol } = useCurrency();

  useEffect(() => {
    if (accountId) {
      fetchAccountDetails();
    }
  }, [accountId]);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      // 1. Account Info
      const accRes = await api.get(`/accounts/${accountId}`);
      // 2. Account Transactions
      const txnRes = await api.get(`/transactions?accountId=${accountId}`);

      setAccount(accRes.data);
      setTransactions(txnRes.data);
    } catch (error) {
      console.error("Error fetching account details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!account) {
    return <div>Account not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{account.name}</h2>
          <p className="text-muted-foreground capitalize">
            {account.type} Account
          </p>
        </div>
      </div>

      {/* Account Balance Card */}
      <Card className="bg-primary text-primary-foreground shadow-xl shadow-primary/20 border-0">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">
                Current Balance
              </p>
              <h1 className="text-4xl font-bold mt-1">
                <span className="text-white/60 text-2xl mr-2 font-normal">
                  {symbol}
                </span>
                {parseFloat(account.balance).toLocaleString()}
              </h1>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transaction History</h3>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>No transactions found for this account.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {transactions.map((txn) => (
              <Card
                key={txn.id}
                className="group hover:bg-muted/50 transition-colors border-l-4 border-l-transparent hover:border-l-primary"
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Dynamic Icon Logic */}
                    {txn.type === "transfer" ? (
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <ArrowRightLeft className="h-5 w-5" />
                      </div>
                    ) : (
                      <CategoryIconView
                        icon={txn.categoryIcon}
                        color={txn.categoryColor}
                      />
                    )}

                    <div>
                      <p className="font-semibold text-sm">
                        {txn.type === "transfer"
                          ? txn.toAccountId === accountId
                            ? `Received from ${txn.accountName}`
                            : `Transfer to ${txn.toAccountName}`
                          : txn.categoryName || "Uncategorized"}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {txn.description ||
                          (txn.type === "transfer"
                            ? "Fund Transfer"
                            : "No description")}
                      </p>

                      {/* --- DATE & TIME DISPLAY --- */}
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground/80 font-medium">
                        <CalendarDays className="h-3 w-3" />
                        <span>{format(new Date(txn.date), "PPP")}</span>
                        <span className="mx-1">•</span>
                        <span>{format(new Date(txn.date), "p")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount Logic */}
                  <div className="text-right">
                    {txn.type === "income" && (
                      <span className="font-bold text-green-600">
                        + {symbol}
                        {txn.amount}
                      </span>
                    )}
                    {txn.type === "expense" && (
                      <span className="font-bold text-red-600">
                        - {symbol}
                        {txn.amount}
                      </span>
                    )}
                    {txn.type === "transfer" && (
                      <span
                        className={`font-bold ${
                          txn.toAccountId === accountId
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {txn.toAccountId === accountId ? "+" : "-"}
                        {symbol}
                        {txn.amount}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
