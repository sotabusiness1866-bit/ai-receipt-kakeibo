"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type CategorySlug } from "@/lib/categories";
import type { ExtractedReceiptData } from "@/types/receipt";
import { Button } from "@/components/ui/Button";
import { Input, FieldLabel } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

type Step = "select" | "analyzing" | "review" | "saving";

interface FormState {
  storeName: string;
  purchaseDate: string;
  totalAmount: string;
  categorySlug: CategorySlug;
  memo: string;
}

const EMPTY_FORM: FormState = {
  storeName: "",
  purchaseDate: "",
  totalAmount: "",
  categorySlug: "other",
  memo: "",
};

export function ReceiptUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const original = e.target.files?.[0];
    if (!original) return;

    setErrorMessage(null);
    setAnalysisFailed(false);
    setStep("analyzing");

    try {
      const isHeic =
        /\.(heic|heif)$/i.test(original.name) ||
        original.type === "image/heic" ||
        original.type === "image/heif";

      let file = original;
      if (isHeic) {
        const heic2any = (await import("heic2any")).default;
        const converted = await heic2any({
          blob: original,
          toType: "image/jpeg",
          quality: 0.9,
        });
        const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
        file = new File(
          [jpegBlob],
          original.name.replace(/\.(heic|heif)$/i, ".jpg"),
          { type: "image/jpeg" }
        );
      }

      setPreviewUrl(URL.createObjectURL(file));

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("認証セッションが切れました。再ログインしてください。");
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(path, file, { contentType: file.type });

      if (uploadError) {
        throw new Error("画像のアップロードに失敗しました");
      }

      setStoragePath(path);

      const res = await fetch("/api/receipts/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath: path }),
      });

      if (!res.ok) {
        setAnalysisFailed(true);
        setForm(EMPTY_FORM);
        setStep("review");
        return;
      }

      const { data } = (await res.json()) as { data: ExtractedReceiptData };
      setForm({
        storeName: data.store_name ?? "",
        purchaseDate: data.purchase_date ?? "",
        totalAmount:
          data.total_amount !== null ? String(data.total_amount) : "",
        categorySlug: data.category ?? "other",
        memo: "",
      });
      setStep("review");
    } catch (err) {
      console.error("receipt upload failed", err);
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "予期しないエラーが発生しました";
      setErrorMessage(message);
      setStep("select");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!storagePath) return;

    setStep("saving");
    setErrorMessage(null);

    const amount = Number(form.totalAmount);
    if (Number.isNaN(amount) || amount < 0) {
      setErrorMessage("金額は0以上の数値で入力してください");
      setStep("review");
      return;
    }

    const res = await fetch("/api/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imagePath: storagePath,
        storeName: form.storeName || null,
        purchaseDate: form.purchaseDate || null,
        totalAmount: amount,
        categorySlug: form.categorySlug,
        memo: form.memo || null,
      }),
    });

    if (!res.ok) {
      setErrorMessage("保存に失敗しました。もう一度お試しください。");
      setStep("review");
      return;
    }

    const { data } = await res.json();
    router.push(`/receipts/${data.id}`);
    router.refresh();
  }

  if (step === "select") {
    return (
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-sm text-gray-600">
          レシートの写真を選択してください
        </p>
        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          画像を選択
        </Button>
      </Card>
    );
  }

  if (step === "analyzing") {
    return (
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="レシートプレビュー"
            className="max-h-64 rounded-lg object-contain"
          />
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Spinner />
          解析中...
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3">
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="レシートプレビュー"
            className="max-h-56 w-full rounded-lg object-contain"
          />
        )}
        {analysisFailed && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            自動解析に失敗しました。手動で入力してください。
          </p>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <Input
          id="storeName"
          label="店名"
          value={form.storeName}
          onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
        />
        <Input
          id="purchaseDate"
          type="date"
          label="購入日"
          value={form.purchaseDate}
          onChange={(e) =>
            setForm((f) => ({ ...f, purchaseDate: e.target.value }))
          }
        />
        <Input
          id="totalAmount"
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
          <FieldLabel htmlFor="categorySlug">カテゴリ</FieldLabel>
          <Select
            id="categorySlug"
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
          id="memo"
          label="メモ（任意）"
          value={form.memo}
          onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))}
        />

        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        <Button type="submit" disabled={step === "saving"}>
          {step === "saving" ? "保存中..." : "保存する"}
        </Button>
      </form>
    </Card>
  );
}
