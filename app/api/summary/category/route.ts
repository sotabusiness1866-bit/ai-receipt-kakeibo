import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, monthRange } from "@/lib/utils/date";
import { CATEGORIES } from "@/lib/categories";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") ?? currentMonthKey();
  const { start, end } = monthRange(monthKey);

  const { data, error } = await supabase
    .from("receipts")
    .select("total_amount, categories(slug)")
    .eq("user_id", user.id)
    .gte("purchase_date", start)
    .lte("purchase_date", end);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totals = new Map<string, { amount: number; count: number }>();
  for (const row of data) {
    const slug =
      (row.categories as { slug: string } | null)?.slug ?? "other";
    const current = totals.get(slug) ?? { amount: 0, count: 0 };
    current.amount += Number(row.total_amount);
    current.count += 1;
    totals.set(slug, current);
  }

  const result = CATEGORIES.filter((c) => totals.has(c.slug)).map((c) => {
    const t = totals.get(c.slug)!;
    return {
      slug: c.slug,
      label: c.label,
      color: c.color,
      amount: t.amount,
      count: t.count,
    };
  });

  return NextResponse.json({ data: { month: monthKey, categories: result } });
}
