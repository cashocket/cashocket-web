"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  Landmark,
  Wallet,
  Banknote,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AccountCardProps {
  account: any;
}

export function AccountCard({ account }: AccountCardProps) {
  const router = useRouter();
  const { symbol } = useCurrency();

  // Simple Icon Logic - No heavy colors
  const getIcon = () => {
    if (account.icon && account.icon.startsWith("data:image")) {
      return (
        <img
          src={account.icon}
          className="h-full w-full object-cover"
          alt="icon"
        />
      );
    }
    switch (account.type) {
      case "bank":
        return <Landmark className="h-5 w-5" />;
      case "wallet":
        return <Wallet className="h-5 w-5" />;
      case "cash":
        return <Banknote className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  return (
    <div
      onClick={() => router.push(`/dashboard/accounts/${account.id}`)}
      className="group relative cursor-pointer"
    >
      <Card className="overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
              {getIcon()}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold leading-none tracking-tight">
                {account.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {account.type}
              </p>
            </div>
          </div>

          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <div className="mt-2">
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <h2 className="text-3xl font-bold tracking-tight">
              {symbol} {parseFloat(account.balance).toLocaleString()}
            </h2>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 py-3">
          <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Active
            </span>
            <span>**** {account.id.slice(-4)}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
