"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function DeleteReceiptButton({ receiptId }: { receiptId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/receipts/${receiptId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setError("削除に失敗しました");
      setDeleting(false);
      return;
    }

    router.push("/receipts");
    router.refresh();
  }

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        削除
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="レシートを削除しますか？">
        <p className="mb-4 text-sm text-gray-600">
          この操作は取り消せません。画像とデータが完全に削除されます。
        </p>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={deleting}
          >
            キャンセル
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "削除中..." : "削除する"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
