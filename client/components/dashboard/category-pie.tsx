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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryPieProps {
  transactions: any[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export function CategoryPie({ transactions }: CategoryPieProps) {
  const { symbol } = useCurrency();

  // Filter only expenses and group by category
  const data = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc: any[], curr) => {
      const existing = acc.find((item) => item.name === curr.categoryName);
      if (existing) {
        existing.value += parseFloat(curr.amount);
      } else {
        acc.push({
          name: curr.categoryName || "Uncategorized",
          value: parseFloat(curr.amount),
        });
      }
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories only

  return (
    <Card className="col-span-3 shadow-sm">
      <CardHeader>
        <CardTitle>Top Expenses by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${symbol}${value}`} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              No expense data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
