"use client";

import { useCurrency } from "@/context/currency-context";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewChartProps {
  data: any[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  const { symbol } = useCurrency();

  // Process data for chart
  const chartData = data
    .reduce((acc: any[], curr) => {
      const dateStr = format(new Date(curr.date), "MMM dd");
      const existing = acc.find((item) => item.date === dateStr);

      const amount = parseFloat(curr.amount);

      if (existing) {
        if (curr.type === "income") existing.income += amount;
        if (curr.type === "expense") existing.expense += amount;
      } else {
        acc.push({
          date: dateStr,
          income: curr.type === "income" ? amount : 0,
          expense: curr.type === "expense" ? amount : 0,
          fullDate: new Date(curr.date), // for sorting
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.fullDate - b.fullDate);

  return (
    <Card className="col-span-4 shadow-sm">
      <CardHeader>
        <CardTitle>Income vs Expense</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${symbol}${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorExpense)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No data available for this period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
