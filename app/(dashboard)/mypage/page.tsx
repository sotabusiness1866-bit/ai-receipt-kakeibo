import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function MyPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">マイページ</h1>

      <Link href="/mypage/categories">
        <Card className="transition-colors hover:border-emerald-300">
          <p className="font-medium text-gray-900">カテゴリ設定</p>
          <p className="mt-1 text-sm text-gray-500">
            利用可能な支出カテゴリの一覧を確認できます
          </p>
        </Card>
      </Link>

      <Link href="/mypage/account">
        <Card className="transition-colors hover:border-emerald-300">
          <p className="font-medium text-gray-900">アカウント設定</p>
          <p className="mt-1 text-sm text-gray-500">
            ログイン中のメールアドレス確認・ログアウト
          </p>
        </Card>
      </Link>
    </div>
  );
}
