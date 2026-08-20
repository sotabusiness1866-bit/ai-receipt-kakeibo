import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";
import { FieldLabel } from "./Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  className,
  label,
  error,
  id,
  children,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <FieldLabel htmlFor={id}>{label}</FieldLabel>}
      <select
        id={id}
        className={cn(
          "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
          "focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500",
          error && "border-red-400 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
