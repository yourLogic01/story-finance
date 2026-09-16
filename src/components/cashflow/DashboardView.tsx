"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { TodayTransactionList } from "@/components/cashflow/TodayTransactionList";
import { MonthlySummaryCard } from "@/components/cashflow/MonthlySummaryCard";
import { CategoryBreakdown } from "@/components/cashflow/CategoryBreakdown";
import { SelfRewardMeter } from "@/components/budget/SelfRewardMeter";
import {
  Category,
  TransactionWithCategory,
  GamificationProfile,
  MonthlySummary,
  SelfRewardAllowance,
} from "@/types";
import { Plus } from "lucide-react";
import { logNoSpendDay, cancelNoSpendDay } from "@/app/actions/no-spend";
import { getMonthlyRecapData, MonthlyRecapData } from "@/app/actions/recap";
import { WishlistSummaryData } from "@/app/actions/wishlist";
import { RetroMonthlyRecapModal } from "@/components/retro/RetroMonthlyRecapModal";
import { DashboardWishlistCard } from "@/components/wishlist/DashboardWishlistCard";
import { getTodayDateString } from "@/lib/utils/date";

interface DashboardViewProps {
  categories: Category[];
  todayTransactions: TransactionWithCategory[];
  monthlySummary: MonthlySummary;
  selfRewardAllowance: SelfRewardAllowance;
  gamification: GamificationProfile | null;
  isNoSpendToday?: boolean;
  wishlistSummary?: WishlistSummaryData | null;
}

export function DashboardView({
  categories,
  todayTransactions,
  monthlySummary,
  selfRewardAllowance,
  gamification,
  isNoSpendToday = false,
  wishlistSummary,
}: DashboardViewProps) {
  const router = useRouter();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNoSpendLoading, setIsNoSpendLoading] = useState(false);

  // Retro Monthly Recap Modal State
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [recapData, setRecapData] = useState<MonthlyRecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);

  const handleOpenRecap = async () => {
    setIsRecapLoading(true);
    try {
      const data = await getMonthlyRecapData();
      setRecapData(data);
      setIsRecapOpen(true);
    } finally {
      setIsRecapLoading(false);
    }
  };

  const handleTransactionSuccess = () => {
    router.refresh();
  };

  const handleMarkNoSpend = async () => {
    setIsNoSpendLoading(true);
    try {
      await logNoSpendDay();
      router.refresh();
    } finally {
      setIsNoSpendLoading(false);
    }
  };

  const handleCancelNoSpend = async () => {
    setIsNoSpendLoading(true);
    try {
      await cancelNoSpendDay(getTodayDateString());
      router.refresh();
    } finally {
      setIsNoSpendLoading(false);
    }
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

        {/* Retro Monthly Digest Trigger Button */}
        <button
          type="button"
          onClick={handleOpenRecap}
          disabled={isRecapLoading}
          className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-pixel text-xs flex items-center justify-between shadow-retro-sm transition-all active:scale-[0.99] border border-slate-800"
        >
          <span className="text-emerald-400">REKAP & FORECAST BULAN INI</span>
          <span className="text-[10px] text-slate-400 font-sans font-medium flex items-center gap-1">
            {isRecapLoading ? "Memuat..." : "Buka ➔"}
          </span>
        </button>

        {/* Guilt-Free Self-Reward Meter (T040) */}
        <SelfRewardMeter allowance={selfRewardAllowance} />

        {/* Wishlist Bag RPG Card */}
        {wishlistSummary && (
          <DashboardWishlistCard
            items={wishlistSummary.items}
            totalSaved={wishlistSummary.totalSaved}
            activeCount={wishlistSummary.activeCount}
          />
        )}

        {/* Quick Add Action Trigger */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Catat Pengeluaran / Pemasukan</span>
        </button>

        {/* Today's Transactions Feed */}
        <TodayTransactionList
          transactions={todayTransactions}
          isNoSpendToday={isNoSpendToday}
          onMarkNoSpend={handleMarkNoSpend}
          onCancelNoSpend={handleCancelNoSpend}
          isNoSpendLoading={isNoSpendLoading}
        />

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

      {/* Retro Monthly Digest Modal */}
      <RetroMonthlyRecapModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
        recapData={recapData}
      />

      {/* Bottom Navigation */}
      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
