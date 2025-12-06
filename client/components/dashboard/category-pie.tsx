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
    <Card className="col-span-4 lg:col-span-3 shadow-sm border-zinc-200 dark:border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base md:text-lg">Top Expenses</CardTitle>
      </CardHeader>

      {/* Mobile: padding-0 to use full width, Desktop: normal padding */}
      <CardContent className="p-0 pb-4 md:p-6">
        <div className="h-[250px] md:h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  // Mobile pe ring thoda patla aur chhota
                  innerRadius={50}
                  outerRadius={70}
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
                <Tooltip
                  formatter={(value: number) => `${symbol}${value}`}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  // Mobile pe font size adjust
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No expense data
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
