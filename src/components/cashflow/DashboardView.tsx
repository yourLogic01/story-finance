"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { TodayTransactionList } from "@/components/cashflow/TodayTransactionList";
import { MonthlySummaryCard } from "@/components/cashflow/MonthlySummaryCard";
import { CategoryBreakdown } from "@/components/cashflow/CategoryBreakdown";
import {
  Category,
  TransactionWithCategory,
  GamificationProfile,
  MonthlySummary,
} from "@/types";
import { Plus } from "lucide-react";

interface DashboardViewProps {
  categories: Category[];
  todayTransactions: TransactionWithCategory[];
  monthlySummary: MonthlySummary;
  gamification: GamificationProfile | null;
}

export function DashboardView({
  categories,
  todayTransactions,
  monthlySummary,
  gamification,
}: DashboardViewProps) {
  const router = useRouter();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleTransactionSuccess = () => {
    router.refresh();
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50/50">
      {/* Top Header with Streaks and XP */}
      <Header
        currentStreak={gamification?.current_streak ?? 0}
        totalXp={gamification?.total_xp ?? 0}
      />

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {/* Monthly Summary Card (T029) */}
        <MonthlySummaryCard summary={monthlySummary} />

        {/* Quick Add Action Trigger */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Catat Pengeluaran / Jajan Sekarang</span>
        </button>

        {/* Today's Transactions Feed */}
        <TodayTransactionList transactions={todayTransactions} />

        {/* Category Breakdown (T030) */}
        <CategoryBreakdown
          breakdowns={monthlySummary.categoryBreakdowns}
          totalExpenses={monthlySummary.totalExpenses}
        />
      </main>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onSuccess={handleTransactionSuccess}
      />

      {/* Bottom Navigation */}
      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
