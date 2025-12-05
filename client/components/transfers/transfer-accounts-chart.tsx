"use client";

import { useCurrency } from "@/context/currency-context";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface TransferAccountsChartProps {
  data: any[];
}

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8"];

export function TransferAccountsChart({ data }: TransferAccountsChartProps) {
  const { symbol } = useCurrency();

  // Group by "From Account"
  const chartData = data
    .reduce((acc: any[], curr) => {
      const accName = curr.accountName || "Unknown";
      const amount = parseFloat(curr.amount);
      const existing = acc.find((item) => item.name === accName);

      if (existing) {
        existing.value += amount;
      } else {
        acc.push({ name: accName, value: amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle>Top Senders</CardTitle>
        <CardDescription>Volume by source account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `${symbol}${value.toLocaleString()}`
                  }
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
