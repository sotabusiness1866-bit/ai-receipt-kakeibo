import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Receipt } from "@/types/receipt";
import type { CategorySlug } from "@/lib/categories";

type ReceiptRow = Database["public"]["Tables"]["receipts"]["Row"];
type ReceiptWithCategory = ReceiptRow & {
  categories: { slug: string } | null;
};

export function mapRowToReceipt(row: ReceiptWithCategory): Receipt {
  return {
    id: row.id,
    storeName: row.store_name,
    purchaseDate: row.purchase_date,
    totalAmount: Number(row.total_amount),
    categorySlug: (row.categories?.slug ?? "other") as CategorySlug,
    memo: row.memo,
    imagePath: row.image_path,
    createdAt: row.created_at,
  };
}

export const RECEIPT_SELECT_WITH_CATEGORY = "*, categories(slug)";

export async function getCategoryIdBySlug(
  supabase: SupabaseClient<Database>,
  slug: CategorySlug
): Promise<number | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data.id;
}

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

/** レシート画像の署名付きURLを一括発行する（receiptId -> URL のマップ） */
export async function getSignedImageUrls(
  supabase: SupabaseClient<Database>,
  receipts: { id: string; imagePath: string }[]
): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {};
  if (receipts.length === 0) return result;

  await Promise.all(
    receipts.map(async (receipt) => {
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(receipt.imagePath, SIGNED_URL_EXPIRY_SECONDS);
      result[receipt.id] = data?.signedUrl ?? null;
    })
  );

  return result;
}
