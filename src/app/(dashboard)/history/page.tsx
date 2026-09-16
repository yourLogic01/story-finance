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

  // Execute queries in parallel to eliminate waterfall latency
  const [{ data: rawCategories }, { data: gamification }, { transactions }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true }),
      supabase
        .from("gamification_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      getTransactions({
        year,
        month,
        limit: 150,
      }),
    ]);

  const categories = (rawCategories || []) as Category[];

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
