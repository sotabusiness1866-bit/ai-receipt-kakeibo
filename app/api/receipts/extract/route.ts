import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  extractReceiptData,
  ReceiptExtractionError,
} from "@/lib/anthropic/extractReceipt";

export const runtime = "nodejs";

const EXTENSION_TO_MEDIA_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const storagePath = body?.storagePath as string | undefined;

  if (!storagePath || typeof storagePath !== "string") {
    return NextResponse.json(
      { error: "storagePathが必要です" },
      { status: 400 }
    );
  }

  // ユーザー本人のパスであることを明示的にチェック（RLSに加えた多層防御）
  if (!storagePath.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const extension = storagePath.split(".").pop()?.toLowerCase() ?? "";
  const mediaType = EXTENSION_TO_MEDIA_TYPE[extension];
  if (!mediaType) {
    return NextResponse.json(
      { error: "対応していない画像形式です" },
      { status: 400 }
    );
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from("receipts")
    .download(storagePath);

  if (downloadError || !blob) {
    return NextResponse.json(
      { error: "画像の取得に失敗しました" },
      { status: 404 }
    );
  }

  const arrayBuffer = await blob.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  try {
    const extracted = await extractReceiptData(
      base64Data,
      mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp"
    );
    return NextResponse.json({ data: extracted });
  } catch (err) {
    if (err instanceof ReceiptExtractionError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: "AI解析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
