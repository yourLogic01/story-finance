import { BudgetWithSpending } from "@/app/actions/budgets";
import { MonthlySummary, TransactionWithCategory } from "@/types";

export interface SafeDailySpendCalculation {
  safeDailyAmount: number;
  spentToday: number;
  remainingToday: number;
  status: "safe" | "warning" | "over";
  percentageUsedToday: number;
  daysRemaining: number;
  totalDaysInMonth: number;
  currentDay: number;
  averageDailyBurn: number;
  basis: "budget" | "income" | "no_budget";
  basisAmount: number;
  totalExpenses: number;
  remainingFunds: number;
}

export function calculateSafeDailySpend({
  monthlySummary,
  todayTransactions,
  budgets = [],
}: {
  monthlySummary: MonthlySummary;
  todayTransactions: TransactionWithCategory[];
  budgets?: BudgetWithSpending[];
}): SafeDailySpendCalculation {
  const now = new Date();
  const year = monthlySummary.year;
  const month = monthlySummary.month;
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const currentDay = Math.min(now.getDate(), totalDaysInMonth);

  // Sisa hari termasuk hari ini (minimal 1 hari)
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);

  // Hari yang sudah berlalu (minimal 1)
  const daysPassed = Math.max(1, currentDay);

  // Total pengeluaran bulan ini & rata-rata pengeluaran aktual per hari
  const totalExpenses = monthlySummary.totalExpenses;
  const averageDailyBurn = Math.round(totalExpenses / daysPassed);

  // Total pengeluaran hari ini saja
  const spentToday = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Tentukan acuan dana (Anggaran atau Pemasukan)
  let basis: "budget" | "income" | "no_budget" = "no_budget";
  let basisAmount = 0;

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.effective_limit, 0);

  if (totalBudgetLimit > 0) {
    basis = "budget";
    basisAmount = totalBudgetLimit;
  } else if (monthlySummary.totalIncome > 0) {
    basis = "income";
    basisAmount = monthlySummary.totalIncome;
  }

  // Sisa dana yang masih aman untuk dibelanjakan di bulan ini
  const remainingFunds = Math.max(0, basisAmount - totalExpenses);

  // Jatah belanja harian yang aman
  const safeDailyAmount =
    basis !== "no_budget" && remainingFunds > 0
      ? Math.max(0, Math.round(remainingFunds / daysRemaining))
      : 0;

  // Sisa jatah hari ini
  const remainingToday = safeDailyAmount - spentToday;

  // Persentase jatah hari ini yang sudah terpakai
  const percentageUsedToday =
    safeDailyAmount > 0
      ? Math.round((spentToday / safeDailyAmount) * 100)
      : spentToday > 0
      ? 100
      : 0;

  // Status pengeluaran hari ini
  let status: "safe" | "warning" | "over" = "safe";
  if (basis === "no_budget") {
    status = "safe";
  } else if (remainingToday < 0 || (safeDailyAmount === 0 && spentToday > 0)) {
    status = "over";
  } else if (percentageUsedToday >= 80) {
    status = "warning";
  }

  return {
    safeDailyAmount,
    spentToday,
    remainingToday,
    status,
    percentageUsedToday,
    daysRemaining,
    totalDaysInMonth,
    currentDay,
    averageDailyBurn,
    basis,
    basisAmount,
    totalExpenses,
    remainingFunds,
  };
}
