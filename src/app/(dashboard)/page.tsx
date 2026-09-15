import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/cashflow/DashboardView";
import { Category, TransactionWithCategory, GamificationProfile } from "@/types";
import { getTodayDateString, getCurrentMonthYear } from "@/lib/utils/date";
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

  // 3. Fetch Monthly Stats
  // Date range for current month
  const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const startOfNextMonth = `${nextMonthYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const { data: monthTx } = await supabase
    .from("transactions")
    .select("type, amount")
    .eq("user_id", user.id)
    .gte("date", startOfMonth)
    .lt("date", startOfNextMonth);

  let totalIncome = 0;
  let totalExpense = 0;

  const monthTxList = (monthTx || []) as Array<{
    type: "income" | "expense";
    amount: number;
  }>;

  for (const tx of monthTxList) {
    const val = Number(tx.amount);
    if (tx.type === "income") {
      totalIncome += val;
    } else {
      totalExpense += val;
    }
  }

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
      monthlyStats={{
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense,
      }}
      gamification={gamification as GamificationProfile | null}
    />
  );
}
