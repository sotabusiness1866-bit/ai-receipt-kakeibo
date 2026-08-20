"use client";

import { useState } from "react";
import type { Receipt } from "@/types/receipt";
import { getCategoryBySlug } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ReceiptImage } from "./ReceiptImage";
import { ReceiptEditForm } from "./ReceiptEditForm";
import { DeleteReceiptButton } from "./DeleteReceiptButton";

interface ReceiptDetailViewProps {
  receipt: Receipt;
  imageUrl: string | null;
}

export function ReceiptDetailView({
  receipt,
  imageUrl,
}: ReceiptDetailViewProps) {
  const [editing, setEditing] = useState(false);
  const category = getCategoryBySlug(receipt.categorySlug);

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-0 overflow-hidden">
        <ReceiptImage
          src={imageUrl}
          alt={receipt.storeName ?? "レシート"}
          className="h-64 w-full"
        />
      </Card>

      <Card>
        {editing ? (
          <ReceiptEditForm receipt={receipt} onCancel={() => setEditing(false)} />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {receipt.storeName || "店名未設定"}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(receipt.purchaseDate)}
                </p>
              </div>
              {category && <Badge color={category.color}>{category.label}</Badge>}
            </div>

            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(receipt.totalAmount)}
            </p>

            {receipt.memo && (
              <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {receipt.memo}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                編集
              </Button>
              <DeleteReceiptButton receiptId={receipt.id} />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
