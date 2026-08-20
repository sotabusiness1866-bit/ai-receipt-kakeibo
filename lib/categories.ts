// Supabaseの categories テーブルと値を一致させること（supabase/migrations/0001_init.sql参照）
export const CATEGORY_SLUGS = [
  "food",
  "daily",
  "transport",
  "entertainment",
  "medical",
  "clothing",
  "housing",
  "utility",
  "communication",
  "other",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryDefinition {
  slug: CategorySlug;
  label: string;
  color: string;
  sortOrder: number;
}

export const CATEGORIES: CategoryDefinition[] = [
  { slug: "food", label: "食費", color: "#F59E0B", sortOrder: 1 },
  { slug: "daily", label: "日用品", color: "#10B981", sortOrder: 2 },
  { slug: "transport", label: "交通費", color: "#3B82F6", sortOrder: 3 },
  { slug: "entertainment", label: "娯楽", color: "#8B5CF6", sortOrder: 4 },
  { slug: "medical", label: "医療", color: "#EF4444", sortOrder: 5 },
  { slug: "clothing", label: "衣服・美容", color: "#EC4899", sortOrder: 6 },
  { slug: "housing", label: "住居", color: "#6366F1", sortOrder: 7 },
  { slug: "utility", label: "水道・光熱費", color: "#14B8A6", sortOrder: 8 },
  { slug: "communication", label: "通信費", color: "#F97316", sortOrder: 9 },
  { slug: "other", label: "その他", color: "#9CA3AF", sortOrder: 10 },
];

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
