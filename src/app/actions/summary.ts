"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthYear, getMonthDateRange } from "@/lib/utils/date";
import { MonthlySummary, Category, FinancialMood } from "@/types";

export async function getMonthlySummary(
  targetYear?: number,
  targetMonth?: number
): Promise<MonthlySummary> {
  const { year: curYear, month: curMonth } = getCurrentMonthYear();
  const year = targetYear || curYear;
  const month = targetMonth || curMonth;

  const defaultSummary: MonthlySummary = {
    month,
    year,
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    transactionCount: 0,
    financialMood: "neutral",
    categoryBreakdowns: [],
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return defaultSummary;
  }

  const { startDate, endDate } = getMonthDateRange(year, month);

  const { data: rows, error } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      date,
      category_id,
      category:categories(id, user_id, name, type, icon, color, is_default, created_at)
    `)
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  if (error || !rows) {
    console.error("Error fetching monthly transactions:", error);
    return defaultSummary;
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryMap = new Map<
    string,
    { category: Category; totalAmount: number }
  >();

  for (const row of rows) {
    const amount = Number(row.amount) || 0;
    if (row.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;

      // Track breakdown for expenses
      if (row.category) {
        const cat = row.category as unknown as Category;
        const current = categoryMap.get(cat.id);
        if (current) {
          current.totalAmount += amount;
        } else {
          categoryMap.set(cat.id, {
            category: cat,
            totalAmount: amount,
          });
        }
      }
    }
  }

  const netBalance = totalIncome - totalExpenses;

  // Determine financial mood
  let financialMood: FinancialMood = "neutral";
  if (totalExpenses === 0 && totalIncome === 0) {
    financialMood = "neutral";
  } else if (netBalance >= 0 && (totalIncome === 0 || totalExpenses <= totalIncome * 0.75)) {
    financialMood = "happy";
  } else if (netBalance < 0) {
    financialMood = "worried";
  }

  const categoryBreakdowns = Array.from(categoryMap.values())
    .map((item) => ({
      category: item.category,
      totalAmount: item.totalAmount,
      percentageOfTotal:
        totalExpenses > 0
          ? Math.round((item.totalAmount / totalExpenses) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  return {
    month,
    year,
    totalIncome,
    totalExpenses,
    netBalance,
    transactionCount: rows.length,
    financialMood,
    categoryBreakdowns,
  };
}
