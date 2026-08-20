import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { currentMonthKey, monthRange } from "@/lib/utils/date";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const monthKey = searchParams.get("month") ?? currentMonthKey();
  const { start, end } = monthRange(monthKey);

  const { data, error } = await supabase
    .from("receipts")
    .select("total_amount")
    .eq("user_id", user.id)
    .gte("purchase_date", start)
    .lte("purchase_date", end);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const totalAmount = data.reduce((sum, r) => sum + Number(r.total_amount), 0);

  return NextResponse.json({
    data: { month: monthKey, totalAmount, count: data.length },
  });
}
