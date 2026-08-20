import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";

/** "YYYY-MM" 形式の月キーを返す（未指定なら当月） */
export function currentMonthKey(): string {
  return format(new Date(), "yyyy-MM");
}

/** "YYYY-MM" から月の開始日・終了日（YYYY-MM-DD）を返す */
export function monthRange(monthKey: string): { start: string; end: string } {
  const base = parseISO(`${monthKey}-01`);
  return {
    start: format(startOfMonth(base), "yyyy-MM-dd"),
    end: format(endOfMonth(base), "yyyy-MM-dd"),
  };
}

export function formatMonthLabel(monthKey: string): string {
  const base = parseISO(`${monthKey}-01`);
  return format(base, "yyyy年M月");
}
