import { createClient } from "@/lib/supabase/server";
import { HistoryView } from "@/components/cashflow/HistoryView";
import { getTransactions } from "@/app/actions/history";
import { getCurrentMonthYear } from "@/lib/utils/date";
import { Category, GamificationProfile } from "@/types";
import { redirect } from "next/navigation";

interface HistoryPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
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

  // 1. Fetch Categories
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  const categories = (rawCategories || []) as Category[];

  // 2. Fetch Gamification Profile
  const { data: gamification } = await supabase
    .from("gamification_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Fetch Transactions for the selected month
  const { transactions } = await getTransactions({
    year,
    month,
    limit: 150,
  });

  return (
    <HistoryView
      categories={categories}
      initialTransactions={transactions}
      gamification={gamification as GamificationProfile | null}
      currentYear={year}
      currentMonth={month}
    />
  );
}
