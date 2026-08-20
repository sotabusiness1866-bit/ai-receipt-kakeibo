import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, monthRange, formatMonthLabel } from "@/lib/utils/date";
import {
  getSignedImageUrls,
  mapRowToReceipt,
  RECEIPT_SELECT_WITH_CATEGORY,
} from "@/lib/receipts";
import { formatCurrency } from "@/lib/utils/format";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReceiptList } from "@/components/receipts/ReceiptList";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const month = currentMonthKey();
  const { start, end } = monthRange(month);

  const [{ data: monthlyRows }, { data: recentRows }] = await Promise.all([
    supabase
      .from("receipts")
      .select("total_amount")
      .eq("user_id", user!.id)
      .gte("purchase_date", start)
      .lte("purchase_date", end),
    supabase
      .from("receipts")
      .select(RECEIPT_SELECT_WITH_CATEGORY)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalAmount = (monthlyRows ?? []).reduce(
    (sum, r) => sum + Number(r.total_amount),
    0
  );
  const recentReceipts = (recentRows ?? []).map(mapRowToReceipt);
  const imageUrls = await getSignedImageUrls(supabase, recentReceipts);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">ホーム</h1>
        <Link href="/receipts/new">
          <Button size="sm">レシート追加</Button>
        </Link>
      </div>

      <Card>
        <p className="text-sm text-gray-500">
          {formatMonthLabel(month)}の支出合計
        </p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {formatCurrency(totalAmount)}
        </p>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            最近のレシート
          </h2>
          <Link href="/receipts" className="text-sm text-emerald-700">
            すべて見る
          </Link>
        </div>
        <ReceiptList receipts={recentReceipts} imageUrls={imageUrls} />
      </div>
    </div>
  );
}
