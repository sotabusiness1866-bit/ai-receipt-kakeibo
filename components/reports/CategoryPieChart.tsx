"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils/format";

interface CategoryDatum {
  slug: string;
  label: string;
  color: string;
  amount: number;
  count: number;
}

export function CategoryPieChart({ categories }: { categories: CategoryDatum[] }) {
  if (categories.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        この月のレシートはまだありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="label"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {categories.map((c) => (
                <Cell key={c.slug} fill={c.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="flex flex-col gap-2">
        {categories
          .slice()
          .sort((a, b) => b.amount - a.amount)
          .map((c) => (
            <li
              key={c.slug}
              className="flex items-center justify-between text-sm"
            >
              <span className="flex items-center gap-2 text-gray-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.label}
                <span className="text-xs text-gray-400">{c.count}件</span>
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(c.amount)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
