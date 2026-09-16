import { createClient } from "@/lib/supabase/server";
import { BudgetView } from "@/components/budget/BudgetView";
import { getBudgets, getSelfRewardAllowance } from "@/app/actions/budgets";
import { getCurrentMonthYear } from "@/lib/utils/date";
import { Category, GamificationProfile } from "@/types";
import { redirect } from "next/navigation";

interface BudgetPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const { year: curYear, month: curMonth } = getCurrentMonthYear();

  const year = resolvedParams.year
    ? parseInt(resolvedParams.year, 10)
    : curYear;
  const month = resolvedParams.month
    ? parseInt(resolvedParams.month, 10)
    : curMonth;

  // Execute all queries in parallel to eliminate waterfall latency
  const [
    { data: rawCategories },
    { budgets, totalIncome },
    selfRewardAllowance,
    { data: gamification },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true }),
    getBudgets(year, month),
    getSelfRewardAllowance(year, month),
    supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const categories = (rawCategories || []) as Category[];

  return (
    <BudgetView
      budgets={budgets}
      categories={categories}
      totalIncome={totalIncome}
      selfRewardAllowance={selfRewardAllowance}
      gamification={gamification as GamificationProfile | null}
      currentYear={year}
      currentMonth={month}
    />
  );
}
