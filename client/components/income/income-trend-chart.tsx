"use client";

import { useCurrency } from "@/context/currency-context";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface IncomeTrendChartProps {
  data: any[];
}

export function IncomeTrendChart({ data }: IncomeTrendChartProps) {
  const { symbol } = useCurrency();

  // Data Processing: Group by Date
  const chartData = data
    .reduce((acc: any[], curr) => {
      const dateKey = format(new Date(curr.date), "MMM dd");
      const existing = acc.find((item) => item.date === dateKey);
      const amount = parseFloat(curr.amount);

      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({
          date: dateKey,
          amount: amount,
          fullDate: new Date(curr.date), // For sorting
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.fullDate - b.fullDate);

  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle>Income Trend</CardTitle>
        <CardDescription>Daily earnings overview</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient
                    id="colorIncomeBar"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
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
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  formatter={(value: number) => [`${symbol}${value}`, "Income"]}
                />
                <Bar
                  dataKey="amount"
                  fill="url(#colorIncomeBar)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
              <p>No data to display</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
