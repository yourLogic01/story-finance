"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentMonthYear,
  getMonthDateRange,
  getMonthName,
} from "@/lib/utils/date";
import { Category } from "@/types";

export interface MonthlyRecapData {
  month: number;
  year: number;
  monthName: string;
  daysInMonth: number;
  daysPassed: number;
  isCurrentMonth: boolean;

  // Cashflow & MoM
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
  prevTotalIncome: number;
  prevTotalExpenses: number;
  incomeDiffPercent: number | null;
  expenseDiffPercent: number | null;
  isExpenseLower: boolean;
  topExpenseCategory: {
    name: string;
    amount: number;
    percentage: number;
    icon: string;
    color: string;
  } | null;

  // Habit & Consistency
  totalLoggedDays: number;
  noSpendDaysCount: number;
  normalLoggedDaysCount: number;
  consistencyRate: number;
  habitTitle: string;
  daysHeatmap: Array<{
    day: number;
    dateStr: string;
    status: "logged" | "no_spend" | "missed" | "future";
    expenseAmount: number;
  }>;

  // Forecast & Budget
  dailyBurnRate: number;
  projectedExpense: number;
  totalBudget: number | null;
  budgetStatus: "safe" | "warning" | "danger" | "no_budget";
  projectedDifference: number;
  summaryAdvice: string;
}

export async function getMonthlyRecapData(
  targetYear?: number,
  targetMonth?: number
): Promise<MonthlyRecapData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { year: curYear, month: curMonth } = getCurrentMonthYear();
  const year = targetYear || curYear;
  const month = targetMonth || curMonth;
  const isCurrentMonth = year === curYear && month === curMonth;

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const daysPassed = isCurrentMonth
    ? Math.min(new Date().getDate(), totalDaysInMonth)
    : totalDaysInMonth;

  // Date ranges
  const { startDate, endDate } = getMonthDateRange(year, month);

  let prevMonth = month - 1;
  let prevYear = year;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const { startDate: prevStart, endDate: prevEnd } = getMonthDateRange(
    prevYear,
    prevMonth
  );

  // Parallel fetch: current tx, prev tx, no spend days, budgets
  const [
    { data: currentTxRaw },
    { data: prevTxRaw },
    { data: noSpendRaw },
    { data: budgetsRaw },
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, amount, type, date, category:categories(*)")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("transactions")
      .select("amount, type")
      .eq("user_id", user.id)
      .gte("date", prevStart)
      .lte("date", prevEnd),
    supabase
      .from("no_spend_days")
      .select("date")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("budgets")
      .select("target_value, category_id, calculation_mode")
      .eq("user_id", user.id)
      .eq("year", year)
      .eq("month", month),
  ]);

  const currentTransactions = currentTxRaw || [];
  const prevTransactions = prevTxRaw || [];
  const noSpendDays = noSpendRaw || [];
  const budgets = budgetsRaw || [];

  // Calculate current month cashflow
  let totalIncome = 0;
  let totalExpenses = 0;
  const expenseByCategory = new Map<
    string,
    { category: Category; amount: number }
  >();
  const dailyExpenses = new Map<string, number>();
  const loggedDates = new Set<string>();

  for (const tx of currentTransactions) {
    const amount = Number(tx.amount) || 0;
    loggedDates.add(tx.date);

    if (tx.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      dailyExpenses.set(tx.date, (dailyExpenses.get(tx.date) || 0) + amount);

      if (tx.category) {
        const cat = tx.category as unknown as Category;
        const current = expenseByCategory.get(cat.id);
        if (current) {
          current.amount += amount;
        } else {
          expenseByCategory.set(cat.id, { category: cat, amount });
        }
      }
    }
  }

  // Top expense category
  let topExpenseCategory: MonthlyRecapData["topExpenseCategory"] = null;
  if (totalExpenses > 0 && expenseByCategory.size > 0) {
    const sortedCategories = Array.from(expenseByCategory.values()).sort(
      (a, b) => b.amount - a.amount
    );
    const top = sortedCategories[0];
    topExpenseCategory = {
      name: top.category.name,
      amount: top.amount,
      percentage: Math.round((top.amount / totalExpenses) * 100),
      icon: top.category.icon,
      color: top.category.color,
    };
  }

  // Previous month cashflow
  let prevTotalIncome = 0;
  let prevTotalExpenses = 0;
  for (const tx of prevTransactions) {
    const amount = Number(tx.amount) || 0;
    if (tx.type === "income") {
      prevTotalIncome += amount;
    } else {
      prevTotalExpenses += amount;
    }
  }

  // MoM Diffs
  let incomeDiffPercent: number | null = null;
  if (prevTotalIncome > 0) {
    incomeDiffPercent = Math.round(
      ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100
    );
  }

  let expenseDiffPercent: number | null = null;
  if (prevTotalExpenses > 0) {
    expenseDiffPercent = Math.round(
      ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100
    );
  }

  const isExpenseLower = totalExpenses <= prevTotalExpenses;
  const netSavings = totalIncome - totalExpenses;
  const savingsRate =
    totalIncome > 0 && netSavings > 0
      ? Math.round((netSavings / totalIncome) * 100)
      : 0;

  // No-Spend Days processing
  const noSpendDatesSet = new Set<string>();
  for (const ns of noSpendDays) {
    noSpendDatesSet.add(ns.date);
  }

  // Days Heatmap & Consistency
  const paddedMonth = String(month).padStart(2, "0");
  const daysHeatmap: MonthlyRecapData["daysHeatmap"] = [];
  let noSpendDaysCount = 0;
  let normalLoggedDaysCount = 0;

  for (let day = 1; day <= totalDaysInMonth; day++) {
    const paddedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
    const expenseAmount = dailyExpenses.get(dateStr) || 0;

    if (isCurrentMonth && day > daysPassed) {
      daysHeatmap.push({
        day,
        dateStr,
        status: "future",
        expenseAmount: 0,
      });
    } else if (noSpendDatesSet.has(dateStr)) {
      noSpendDaysCount += 1;
      daysHeatmap.push({
        day,
        dateStr,
        status: "no_spend",
        expenseAmount: 0,
      });
    } else if (loggedDates.has(dateStr)) {
      normalLoggedDaysCount += 1;
      daysHeatmap.push({
        day,
        dateStr,
        status: "logged",
        expenseAmount,
      });
    } else {
      daysHeatmap.push({
        day,
        dateStr,
        status: "missed",
        expenseAmount: 0,
      });
    }
  }

  const totalLoggedDays = normalLoggedDaysCount + noSpendDaysCount;
  const consistencyRate =
    daysPassed > 0 ? Math.round((totalLoggedDays / daysPassed) * 100) : 0;

  let habitTitle = "Perlu Dibiasakan";
  if (consistencyRate >= 80) habitTitle = "Sangat Rutin";
  else if (consistencyRate >= 60) habitTitle = "Cukup Teratur";
  else if (consistencyRate >= 35) habitTitle = "Mulai Rajin";

  // Forecast & Budget Analysis
  const dailyBurnRate =
    daysPassed > 0 ? Math.round(totalExpenses / daysPassed) : 0;

  const remainingDays = isCurrentMonth ? totalDaysInMonth - daysPassed : 0;
  const projectedExpense = isCurrentMonth
    ? totalExpenses + dailyBurnRate * remainingDays
    : totalExpenses;

  // Calculate total budget limit
  let totalBudget: number | null = null;
  if (budgets.length > 0) {
    const globalBudget = budgets.find((b) => b.category_id === null);
    if (globalBudget) {
      if (globalBudget.calculation_mode === "percentage") {
        totalBudget = (Number(globalBudget.target_value) / 100) * totalIncome;
      } else {
        totalBudget = Number(globalBudget.target_value);
      }
    } else {
      // Sum of category budgets
      totalBudget = budgets.reduce((acc, b) => {
        if (b.calculation_mode === "percentage") {
          return acc + (Number(b.target_value) / 100) * totalIncome;
        }
        return acc + Number(b.target_value);
      }, 0);
    }
  }

  let budgetStatus: MonthlyRecapData["budgetStatus"] = "no_budget";
  let projectedDifference = 0;

  if (totalBudget !== null && totalBudget > 0) {
    projectedDifference = projectedExpense - totalBudget;
    if (projectedExpense <= totalBudget) {
      budgetStatus = "safe";
    } else if (projectedExpense <= totalBudget * 1.1) {
      budgetStatus = "warning";
    } else {
      budgetStatus = "danger";
    }
  }

  // Summary Advice (Grounded, human, casual)
  let summaryAdvice = "";
  if (isCurrentMonth) {
    if (budgetStatus === "safe") {
      summaryAdvice = `Rata-rata belanjamu Rp ${dailyBurnRate.toLocaleString("id-ID")}/hari. Posisi ini masih aman di bawah target anggaran.`;
    } else if (budgetStatus === "warning") {
      summaryAdvice = `Rata-rata belanja harianmu Rp ${dailyBurnRate.toLocaleString("id-ID")}. Agak mepet sama batas anggaran, coba lebih jaga pengeluaran harian.`;
    } else if (budgetStatus === "danger") {
      summaryAdvice = `Rata-rata belanjamu Rp ${dailyBurnRate.toLocaleString("id-ID")}/hari. Berpotensi lewat budget kalau pos jajan belum direm.`;
    } else {
      summaryAdvice = `Rata-rata belanjamu Rp ${dailyBurnRate.toLocaleString("id-ID")}/hari. Perkiraan sampai akhir bulan sekitar Rp ${projectedExpense.toLocaleString("id-ID")}.`;
    }
  } else {
    if (netSavings > 0) {
      summaryAdvice = `Bulan ini ada sisa uang tabungan Rp ${netSavings.toLocaleString("id-ID")}. Lumayan buat nambah simpanan.`;
    } else {
      summaryAdvice = `Bulan ini pengeluaran lebih besar dari pemasukan. Bisa jadi bahan evaluasi buat bulan depan.`;
    }
  }

  return {
    month,
    year,
    monthName: `${getMonthName(month)} ${year}`,
    daysInMonth: totalDaysInMonth,
    daysPassed,
    isCurrentMonth,

    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    transactionCount: currentTransactions.length,
    prevTotalIncome,
    prevTotalExpenses,
    incomeDiffPercent,
    expenseDiffPercent,
    isExpenseLower,
    topExpenseCategory,

    totalLoggedDays,
    noSpendDaysCount,
    normalLoggedDaysCount,
    consistencyRate,
    habitTitle,
    daysHeatmap,

    dailyBurnRate,
    projectedExpense,
    totalBudget,
    budgetStatus,
    projectedDifference,
    summaryAdvice,
  };
}
