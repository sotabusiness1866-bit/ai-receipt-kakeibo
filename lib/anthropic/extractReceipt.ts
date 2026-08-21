import { getAnthropicClient } from "./client";
import { CATEGORY_SLUGS } from "@/lib/categories";
import type { ExtractedReceiptData } from "@/types/receipt";

type SupportedImageMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

const RECEIPT_SCHEMA = {
  type: "object",
  properties: {
    store_name: {
      type: ["string", "null"],
      description: "店舗名。読み取れない場合はnull",
    },
    purchase_date: {
      type: ["string", "null"],
      description: "購入日。YYYY-MM-DD形式。読み取れない場合はnull",
    },
    total_amount: {
      type: ["number", "null"],
      description:
        "支払い合計金額（税込）。通貨記号・カンマなしの数値。読み取れない場合はnull",
    },
    category: {
      type: "string",
      enum: CATEGORY_SLUGS as unknown as string[],
      description: "最も適切と思われる支出カテゴリのslug",
    },
  },
  required: ["store_name", "purchase_date", "total_amount", "category"],
  additionalProperties: false,
} as const;

export class ReceiptExtractionError extends Error {}

/**
 * レシート画像をClaude Vision APIに渡し、店名・日付・金額・カテゴリを抽出する。
 */
export async function extractReceiptData(
  base64Data: string,
  mediaType: SupportedImageMediaType
): Promise<ExtractedReceiptData> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system:
      "あなたはレシート画像から店名・購入日・合計金額・支出カテゴリを抽出する専門アシスタントです。" +
      "日本語・英語両方のレシートに対応してください。読み取れない項目は必ずnullを返してください。" +
      "合計金額は最終的な支払金額（税込）を数値のみで返してください。",
    output_config: {
      format: { type: "json_schema", schema: RECEIPT_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: "text",
            text: "このレシート画像から店名・購入日・合計金額・カテゴリを抽出してください。",
          },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new ReceiptExtractionError("AIが画像の解析を拒否しました");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new ReceiptExtractionError("AIからの応答にテキストが含まれていません");
  }

  try {
    const parsed = JSON.parse(textBlock.text) as ExtractedReceiptData;
    return parsed;
  } catch {
    throw new ReceiptExtractionError("AIの応答をJSONとして解析できませんでした");
  }
}
