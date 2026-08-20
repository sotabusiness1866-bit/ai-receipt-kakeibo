import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { LogoutButton } from "@/components/layout/LogoutButton";

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">アカウント設定</h1>
      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-gray-500">ログイン中のメールアドレス</p>
          <p className="text-sm font-medium text-gray-900">
            {user?.email ?? "不明"}
          </p>
        </div>
        <LogoutButton />
      </Card>
    </div>
  );
}
