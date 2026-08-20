"use client";

import { useRouter, usePathname } from "next/navigation";

interface MonthSelectorProps {
  month: string;
}

export function MonthSelector({ month }: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <input
      type="month"
      value={month}
      onChange={(e) => {
        if (!e.target.value) return;
        router.push(`${pathname}?month=${e.target.value}`);
      }}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
    />
  );
}
