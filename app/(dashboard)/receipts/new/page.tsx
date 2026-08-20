import { ReceiptUploadForm } from "@/components/receipts/ReceiptUploadForm";

export default function NewReceiptPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">レシート追加</h1>
      <ReceiptUploadForm />
    </div>
  );
}
