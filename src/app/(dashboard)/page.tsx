import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/cashflow/DashboardView";
import { Category, TransactionWithCategory, GamificationProfile } from "@/types";
import { getTodayDateString, getCurrentMonthYear } from "@/lib/utils/date";
import { getMonthlySummary } from "@/app/actions/summary";
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

  // 1. Fetch Categories
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const categories = (rawCategories || []) as Category[];

  // 2. Fetch Today's Transactions
  const { data: rawTodayTx } = await supabase
    .from("transactions")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .eq("date", todayStr)
    .order("created_at", { ascending: false });

  const todayTransactions = (rawTodayTx || []) as TransactionWithCategory[];

  // 3. Fetch Monthly Summary
  const monthlySummary = await getMonthlySummary(year, month);

  // 4. Fetch Gamification Profile
  const { data: gamification } = await supabase
    .from("gamification_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <DashboardView
      categories={categories}
      todayTransactions={todayTransactions}
      monthlySummary={monthlySummary}
      gamification={gamification as GamificationProfile | null}
    />
  );
}
