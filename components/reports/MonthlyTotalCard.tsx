import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/format";
import { formatMonthLabel } from "@/lib/utils/date";

interface MonthlyTotalCardProps {
  month: string;
  totalAmount: number;
  count: number;
}

export function MonthlyTotalCard({
  month,
  totalAmount,
  count,
}: MonthlyTotalCardProps) {
  return (
    <Card>
      <p className="text-sm text-gray-500">{formatMonthLabel(month)}の支出合計</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">
        {formatCurrency(totalAmount)}
      </p>
      <p className="mt-1 text-xs text-gray-500">{count}件のレシート</p>
    </Card>
  );
}
