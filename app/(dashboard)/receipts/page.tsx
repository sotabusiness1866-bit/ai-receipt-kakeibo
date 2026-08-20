import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getSignedImageUrls,
  mapRowToReceipt,
  RECEIPT_SELECT_WITH_CATEGORY,
} from "@/lib/receipts";
import { ReceiptList } from "@/components/receipts/ReceiptList";
import { Button } from "@/components/ui/Button";

export default async function ReceiptsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("receipts")
    .select(RECEIPT_SELECT_WITH_CATEGORY)
    .eq("user_id", user!.id)
    .order("purchase_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(50);

  const receipts = (data ?? []).map(mapRowToReceipt);
  const imageUrls = await getSignedImageUrls(supabase, receipts);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">レシート一覧</h1>
        <Link href="/receipts/new">
          <Button size="sm">追加</Button>
        </Link>
      </div>
      <ReceiptList receipts={receipts} imageUrls={imageUrls} />
    </div>
  );
}
