"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { TodayTransactionList } from "@/components/cashflow/TodayTransactionList";
import { Category, TransactionWithCategory, GamificationProfile } from "@/types";
import { Plus, Sparkles, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";

interface DashboardViewProps {
  categories: Category[];
  todayTransactions: TransactionWithCategory[];
  monthlyStats: {
    income: number;
    expense: number;
    net: number;
  };
  gamification: GamificationProfile | null;
}

export function DashboardView({
  categories,
  todayTransactions,
  monthlyStats,
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
        {/* Monthly Balance Snapshot Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-retro border border-slate-900 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sisa Saldo Bulan Ini</span>
            </span>
            <span className="text-[10px] font-pixel text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              CASHFLOW
            </span>
          </div>

          <h3 className="text-2xl font-bold font-pixel tracking-tight mb-4 text-emerald-400">
            {formatIDR(monthlyStats.net)}
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Pemasukan</span>
                <span className="text-xs font-bold text-slate-100 leading-tight">
                  {formatIDR(monthlyStats.income)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block leading-tight">Pengeluaran</span>
                <span className="text-xs font-bold text-slate-100 leading-tight">
                  {formatIDR(monthlyStats.expense)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Big Action Trigger */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span>Catat Pengeluaran / Jajan Sekarang</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-300 ml-1" />
        </button>

        {/* Today's Transactions Feed */}
        <TodayTransactionList transactions={todayTransactions} />
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
