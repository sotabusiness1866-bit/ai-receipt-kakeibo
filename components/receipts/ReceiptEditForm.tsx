"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Receipt } from "@/types/receipt";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ReceiptEditFormProps {
  receipt: Receipt;
  onCancel: () => void;
}

export function ReceiptEditForm({ receipt, onCancel }: ReceiptEditFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    storeName: receipt.storeName ?? "",
    purchaseDate: receipt.purchaseDate ?? "",
    totalAmount: String(receipt.totalAmount),
    categorySlug: receipt.categorySlug,
    memo: receipt.memo ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const amount = Number(form.totalAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setError("金額は0以上の数値で入力してください");
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/receipts/${receipt.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName: form.storeName || null,
        purchaseDate: form.purchaseDate || null,
        totalAmount: amount,
        categorySlug: form.categorySlug,
        memo: form.memo || null,
      }),
    });

    if (!res.ok) {
      setError("更新に失敗しました");
      setSaving(false);
      return;
    }

    router.refresh();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="edit-storeName"
        label="店名"
        value={form.storeName}
        onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
      />
      <Input
        id="edit-purchaseDate"
        type="date"
        label="購入日"
        value={form.purchaseDate}
        onChange={(e) =>
          setForm((f) => ({ ...f, purchaseDate: e.target.value }))
        }
      />
      <Input
        id="edit-totalAmount"
        type="number"
        min="0"
        step="1"
        label="合計金額（円）"
        required
        value={form.totalAmount}
        onChange={(e) =>
          setForm((f) => ({ ...f, totalAmount: e.target.value }))
        }
      />
      <div className="flex flex-col gap-1">
        <FieldLabel htmlFor="edit-categorySlug">カテゴリ</FieldLabel>
        <Select
          id="edit-categorySlug"
          value={form.categorySlug}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              categorySlug: e.target.value as CategorySlug,
            }))
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>
      <Input
        id="edit-memo"
        label="メモ（任意）"
        value={form.memo}
        onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? "保存中..." : "保存する"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
