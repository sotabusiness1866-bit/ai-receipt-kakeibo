import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, monthRange } from "@/lib/utils/date";
import { MonthSelector } from "@/components/reports/MonthSelector";
import { MonthlyTotalCard } from "@/components/reports/MonthlyTotalCard";

interface MonthlyReportPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function MonthlyReportPage({
  searchParams,
}: MonthlyReportPageProps) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ?? currentMonthKey();
  const { start, end } = monthRange(month);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("receipts")
    .select("total_amount")
    .eq("user_id", user!.id)
    .gte("purchase_date", start)
    .lte("purchase_date", end);

  const totalAmount = (data ?? []).reduce(
    (sum, r) => sum + Number(r.total_amount),
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">月次サマリー</h1>
        <MonthSelector month={month} />
      </div>
      <MonthlyTotalCard
        month={month}
        totalAmount={totalAmount}
        count={data?.length ?? 0}
      />
    </div>
  );
}
