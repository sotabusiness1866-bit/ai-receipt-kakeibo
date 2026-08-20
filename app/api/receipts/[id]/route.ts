import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { receiptUpdateSchema } from "@/lib/validation";
import {
  getCategoryIdBySlug,
  mapRowToReceipt,
  RECEIPT_SELECT_WITH_CATEGORY,
} from "@/lib/receipts";
import type { Database } from "@/types/database";

type ReceiptUpdatePayload = Database["public"]["Tables"]["receipts"]["Update"];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("receipts")
    .select(RECEIPT_SELECT_WITH_CATEGORY)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "レシートが見つかりません" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: mapRowToReceipt(data) });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = receiptUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容が不正です", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { storeName, purchaseDate, totalAmount, categorySlug, memo } =
    parsed.data;

  const updatePayload: ReceiptUpdatePayload = {
    updated_at: new Date().toISOString(),
  };
  if (storeName !== undefined) updatePayload.store_name = storeName;
  if (purchaseDate !== undefined) updatePayload.purchase_date = purchaseDate;
  if (totalAmount !== undefined) updatePayload.total_amount = totalAmount;
  if (memo !== undefined) updatePayload.memo = memo;
  if (categorySlug !== undefined) {
    const categoryId = await getCategoryIdBySlug(supabase, categorySlug);
    if (categoryId === null) {
      return NextResponse.json(
        { error: "カテゴリが不正です" },
        { status: 400 }
      );
    }
    updatePayload.category_id = categoryId;
  }

  const { data, error } = await supabase
    .from("receipts")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(RECEIPT_SELECT_WITH_CATEGORY)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "レシートの更新に失敗しました" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: mapRowToReceipt(data) });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from("receipts")
    .select("image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "レシートが見つかりません" },
      { status: 404 }
    );
  }

  const { error: deleteError } = await supabase
    .from("receipts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: "削除に失敗しました" },
      { status: 500 }
    );
  }

  await supabase.storage.from("receipts").remove([existing.image_path]);

  return NextResponse.json({ success: true });
}
