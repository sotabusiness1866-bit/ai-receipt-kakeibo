import Link from "next/link";
import type { Receipt } from "@/types/receipt";
import { getCategoryBySlug } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { ReceiptImage } from "./ReceiptImage";

interface ReceiptCardProps {
  receipt: Receipt;
  imageUrl: string | null;
}

export function ReceiptCard({ receipt, imageUrl }: ReceiptCardProps) {
  const category = getCategoryBySlug(receipt.categorySlug);

  return (
    <Link
      href={`/receipts/${receipt.id}`}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-colors hover:border-emerald-300"
    >
      <ReceiptImage
        src={imageUrl}
        alt={receipt.storeName ?? "レシート"}
        className="h-14 w-14 shrink-0 rounded-lg"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {receipt.storeName || "店名未設定"}
          </p>
          <p className="shrink-0 text-sm font-semibold text-gray-900">
            {formatCurrency(receipt.totalAmount)}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            {formatDate(receipt.purchaseDate)}
          </p>
          {category && <Badge color={category.color}>{category.label}</Badge>}
        </div>
      </div>
    </Link>
  );
}
