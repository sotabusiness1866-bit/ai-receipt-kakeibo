import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, monthRange, formatMonthLabel } from "@/lib/utils/date";
import { CATEGORIES } from "@/lib/categories";
import { MonthSelector } from "@/components/reports/MonthSelector";
import { CategoryPieChart } from "@/components/reports/CategoryPieChart";
import { Card } from "@/components/ui/Card";

interface CategoryReportPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function CategoryReportPage({
  searchParams,
}: CategoryReportPageProps) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonthKey();
  const { start, end } = monthRange(month);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("receipts")
    .select("total_amount, categories(slug)")
    .eq("user_id", user!.id)
    .gte("purchase_date", start)
    .lte("purchase_date", end);

  const totals = new Map<string, { amount: number; count: number }>();
  for (const row of data ?? []) {
    const slug = (row.categories as { slug: string } | null)?.slug ?? "other";
    const current = totals.get(slug) ?? { amount: 0, count: 0 };
    current.amount += Number(row.total_amount);
    current.count += 1;
    totals.set(slug, current);
  }

  const categories = CATEGORIES.filter((c) => totals.has(c.slug)).map((c) => {
    const t = totals.get(c.slug)!;
    return {
      slug: c.slug,
      label: c.label,
      color: c.color,
      amount: t.amount,
      count: t.count,
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">カテゴリ別内訳</h1>
        <MonthSelector month={month} />
      </div>
      <Card>
        <p className="mb-3 text-sm text-gray-500">
          {formatMonthLabel(month)}のカテゴリ別支出
        </p>
        <CategoryPieChart categories={categories} />
      </Card>
    </div>
  );
}
