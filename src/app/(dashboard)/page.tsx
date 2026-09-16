import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/cashflow/DashboardView";
import { Category, TransactionWithCategory, GamificationProfile } from "@/types";
import { getTodayDateString, getCurrentMonthYear } from "@/lib/utils/date";
import { getMonthlySummary } from "@/app/actions/summary";
import { getSelfRewardAllowance } from "@/app/actions/budgets";
import { isTodayNoSpend } from "@/app/actions/no-spend";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const todayStr = getTodayDateString();
  const { month, year } = getCurrentMonthYear();

  // Execute all dashboard queries in parallel to eliminate waterfall latency
  const [
    { data: rawCategories },
    { data: rawTodayTx },
    monthlySummary,
    selfRewardAllowance,
    { data: gamification },
    isNoSpendToday,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true }),
    supabase
      .from("transactions")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .order("created_at", { ascending: false }),
    getMonthlySummary(year, month),
    getSelfRewardAllowance(year, month),
    supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    isTodayNoSpend(),
  ]);

  const categories = (rawCategories || []) as Category[];
  const todayTransactions = (rawTodayTx || []) as TransactionWithCategory[];

  return (
    <DashboardView
      categories={categories}
      todayTransactions={todayTransactions}
      monthlySummary={monthlySummary}
      selfRewardAllowance={selfRewardAllowance}
      gamification={gamification as GamificationProfile | null}
      isNoSpendToday={isNoSpendToday}
    />
  );
}
