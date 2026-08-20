import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">支出レポート</h1>

      <Link href="/reports/monthly">
        <Card className="transition-colors hover:border-emerald-300">
          <p className="font-medium text-gray-900">月次サマリー</p>
          <p className="mt-1 text-sm text-gray-500">
            月ごとの支出合計を確認できます
          </p>
        </Card>
      </Link>

      <Link href="/reports/category">
        <Card className="transition-colors hover:border-emerald-300">
          <p className="font-medium text-gray-900">カテゴリ別内訳</p>
          <p className="mt-1 text-sm text-gray-500">
            カテゴリごとの支出割合をグラフで確認できます
          </p>
        </Card>
      </Link>
    </div>
  );
}
