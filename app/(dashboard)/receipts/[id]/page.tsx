import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getSignedImageUrls,
  mapRowToReceipt,
  RECEIPT_SELECT_WITH_CATEGORY,
} from "@/lib/receipts";
import { ReceiptDetailView } from "@/components/receipts/ReceiptDetailView";

interface ReceiptDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReceiptDetailPage({
  params,
}: ReceiptDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("receipts")
    .select(RECEIPT_SELECT_WITH_CATEGORY)
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (error || !data) {
    notFound();
  }

  const receipt = mapRowToReceipt(data);
  const imageUrls = await getSignedImageUrls(supabase, [receipt]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/receipts" className="text-sm text-emerald-700">
        ← レシート一覧に戻る
      </Link>
      <ReceiptDetailView receipt={receipt} imageUrl={imageUrls[receipt.id]} />
    </div>
  );
}
