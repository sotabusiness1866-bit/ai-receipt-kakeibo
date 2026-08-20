import type { Receipt } from "@/types/receipt";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ReceiptCard } from "./ReceiptCard";

interface ReceiptListProps {
  receipts: Receipt[];
  imageUrls: Record<string, string | null>;
}

export function ReceiptList({ receipts, imageUrls }: ReceiptListProps) {
  if (receipts.length === 0) {
    return (
      <EmptyState
        title="レシートがまだありません"
        description="レシートを撮影・アップロードして家計簿をはじめましょう。"
        action={
          <Link href="/receipts/new">
            <Button>レシートを追加</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {receipts.map((receipt) => (
        <ReceiptCard
          key={receipt.id}
          receipt={receipt}
          imageUrl={imageUrls[receipt.id] ?? null}
        />
      ))}
    </div>
  );
}
