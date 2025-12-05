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

interface ExpenseCategoryChartProps {
  data: any[];
}

const COLORS = [
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
];

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const { symbol } = useCurrency();

  // Data Processing
  const chartData = data
    .reduce((acc: any[], curr) => {
      const catName = curr.categoryName || "Uncategorized";
      const amount = parseFloat(curr.amount);
      const existing = acc.find((item) => item.name === catName);

      if (existing) {
        existing.value += amount;
      } else {
        acc.push({ name: catName, value: amount });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value);

  return (
    <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader>
        <CardTitle>Where money went</CardTitle>
        <CardDescription>Expenses by category</CardDescription>
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
