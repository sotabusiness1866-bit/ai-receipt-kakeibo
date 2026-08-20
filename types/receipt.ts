import type { CategorySlug } from "@/lib/categories";

export interface Receipt {
  id: string;
  storeName: string | null;
  purchaseDate: string | null;
  totalAmount: number;
  categorySlug: CategorySlug;
  memo: string | null;
  imagePath: string;
  createdAt: string;
}

export interface ExtractedReceiptData {
  store_name: string | null;
  purchase_date: string | null;
  total_amount: number | null;
  category: CategorySlug;
}
