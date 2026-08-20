import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { receiptCreateSchema } from "@/lib/validation";
import {
  getCategoryIdBySlug,
  mapRowToReceipt,
  RECEIPT_SELECT_WITH_CATEGORY,
} from "@/lib/receipts";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    50,
    Math.max(1, Number(searchParams.get("pageSize") ?? "20"))
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("receipts")
    .select(RECEIPT_SELECT_WITH_CATEGORY)
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: data.map(mapRowToReceipt),
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = receiptCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力内容が不正です", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { imagePath, storeName, purchaseDate, totalAmount, categorySlug, memo } =
    parsed.data;

  if (!imagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const categoryId = await getCategoryIdBySlug(supabase, categorySlug);
  if (categoryId === null) {
    return NextResponse.json(
      { error: "カテゴリが不正です" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("receipts")
    .insert({
      user_id: user.id,
      store_name: storeName ?? null,
      purchase_date: purchaseDate ?? null,
      total_amount: totalAmount,
      category_id: categoryId,
      memo: memo ?? null,
      image_path: imagePath,
    })
    .select(RECEIPT_SELECT_WITH_CATEGORY)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "保存に失敗しました" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: mapRowToReceipt(data) }, { status: 201 });
}
