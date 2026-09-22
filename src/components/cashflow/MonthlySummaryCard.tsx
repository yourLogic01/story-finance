"use client";

import { Wallet, TrendingUp, TrendingDown, Eye, EyeOff } from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";
import { getMonthName } from "@/lib/utils/date";
import { MonthlySummary } from "@/types";
import { RetroMoodAvatar } from "@/components/retro/RetroMoodAvatar";
import { usePrivacy } from "@/context/PrivacyContext";

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
}

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const monthName = getMonthName(summary.month);
  const isSurplus = summary.netBalance >= 0;

  // Mood badge configuration
  const moodConfig = {
    happy: {
      label: "SEHAT",
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
    },
    neutral: {
      label: "STABIL",
      color: "text-sky-400 bg-sky-950/60 border-sky-800",
    },
    worried: {
      label: "DEFISIT",
      color: "text-rose-400 bg-rose-950/60 border-rose-800",
    },
  }[summary.financialMood];

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-retro border border-slate-900 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Saldo {monthName} {summary.year}
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <RetroMoodAvatar mood={summary.financialMood} size="sm" />
          <span className={`text-[9px] font-pixel px-2 py-0.5 rounded border ${moodConfig.color}`}>
            {moodConfig.label}
          </span>
        </div>
      </div>

      {/* Big Net Balance */}
      <div className="my-3">
        <div className="flex items-center gap-2">
          <h3
            className={`text-2xl font-bold font-pixel tracking-tight ${
              isPrivacyMode ? "text-slate-200" : isSurplus ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPrivacyMode ? "Rp ******" : formatIDR(summary.netBalance)}
          </h3>
          <button
            type="button"
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? "Tampilkan nominal" : "Sembunyikan nominal (Mode Privasi)"}
            aria-label={isPrivacyMode ? "Tampilkan nominal" : "Sembunyikan nominal"}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors active:scale-90"
          >
            {isPrivacyMode ? (
              <EyeOff className="w-4 h-4 text-emerald-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400 hover:text-slate-200" />
            )}
          </button>
        </div>
        <span className="text-[10px] text-slate-400 block mt-0.5">
          {summary.transactionCount} transaksi tercatat bulan ini
        </span>
      </div>

      {/* Sub-Stats Grid: Income & Expense */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">Pemasukan</span>
            <span className="text-xs font-bold text-slate-100 leading-tight font-pixel">
              {isPrivacyMode ? "Rp ******" : formatIDR(summary.totalIncome)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block leading-tight">Pengeluaran</span>
            <span className="text-xs font-bold text-slate-100 leading-tight font-pixel">
              {isPrivacyMode ? "Rp ******" : formatIDR(summary.totalExpenses)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
