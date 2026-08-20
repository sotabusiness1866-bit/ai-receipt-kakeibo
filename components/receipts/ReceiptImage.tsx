import { cn } from "@/lib/utils/cn";

interface ReceiptImageProps {
  src: string | null;
  alt: string;
  className?: string;
}

export function ReceiptImage({ src, alt, className }: ReceiptImageProps) {
  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 text-xs text-gray-400",
          className
        )}
      >
        画像なし
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn("object-cover", className)} />
  );
}
