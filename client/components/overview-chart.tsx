"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface OverviewChartProps {
  income: number;
  expense: number;
}

export function OverviewChart({ income, expense }: OverviewChartProps) {
  // Data tayyar karte hain chart ke liye
  const data = [
    {
      name: "Income",
      total: income,
      fill: "#10b981", // Emerald-500
    },
    {
      name: "Expense",
      total: expense,
      fill: "#e11d48", // Rose-600
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
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
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={60} />
      </BarChart>
    </ResponsiveContainer>
  );
}
