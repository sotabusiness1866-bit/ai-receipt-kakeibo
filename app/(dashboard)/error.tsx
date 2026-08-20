"use client";

import { Button } from "@/components/ui/Button";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="text-sm font-medium text-gray-900">
        エラーが発生しました
      </p>
      <p className="text-sm text-gray-500">
        しばらくしてからもう一度お試しください。
      </p>
      <Button size="sm" onClick={reset}>
        再試行
      </Button>
    </div>
  );
}
