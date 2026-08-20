import { CATEGORIES } from "@/lib/categories";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function CategoriesSettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">カテゴリ設定</h1>
      <p className="text-sm text-gray-500">
        現在利用できる支出カテゴリの一覧です（MVPでは編集はできません）。
      </p>
      <Card className="flex flex-col gap-2">
        {CATEGORIES.map((c) => (
          <div
            key={c.slug}
            className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
          >
            <Badge color={c.color}>{c.label}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
