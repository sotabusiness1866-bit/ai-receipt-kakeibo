import { z } from "zod";
import { CATEGORY_SLUGS } from "@/lib/categories";

export const receiptCreateSchema = z.object({
  imagePath: z.string().min(1),
  storeName: z.string().trim().max(200).nullable().optional(),
  purchaseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  totalAmount: z.number().min(0).max(100_000_000),
  categorySlug: z.enum(CATEGORY_SLUGS),
  memo: z.string().trim().max(1000).nullable().optional(),
});

export type ReceiptCreateInput = z.infer<typeof receiptCreateSchema>;

export const receiptUpdateSchema = receiptCreateSchema
  .omit({ imagePath: true })
  .partial();

export type ReceiptUpdateInput = z.infer<typeof receiptUpdateSchema>;
