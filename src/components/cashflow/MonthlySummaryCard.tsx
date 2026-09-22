"use client";

import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Flame,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";
import { getMonthName } from "@/lib/utils/date";
import { MonthlySummary } from "@/types";
import { RetroMoodAvatar } from "@/components/retro/RetroMoodAvatar";
import { usePrivacy } from "@/context/PrivacyContext";
import { SafeDailySpendCalculation } from "@/lib/cashflow/safeDailySpend";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
  safeDailySpend?: SafeDailySpendCalculation;
}

export function MonthlySummaryCard({ summary, safeDailySpend }: MonthlySummaryCardProps) {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

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

  const hasSafeDailySpend = !!safeDailySpend;
  const isOverToday = (safeDailySpend?.remainingToday ?? 0) < 0;

  return (
    <>
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

        {/* Big Net Balance with Eye Toggle Button */}
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

        {/* Compact Safe Daily Spend / Burn Rate Strip */}
        {hasSafeDailySpend && (
          <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {safeDailySpend.basis !== "no_budget" ? (
                <span className="text-[11px] text-slate-300 truncate">
                  Batas aman:{" "}
                  <strong className="font-pixel text-[10px] text-amber-300">
                    {formatIDR(safeDailySpend.safeDailyAmount)}/hari
                  </strong>
                  {safeDailySpend.spentToday > 0 && (
                    <span className="text-slate-400 text-[10px] ml-1">
                      ({isOverToday ? "lewat" : "sisa"}{" "}
                      {formatIDR(Math.abs(safeDailySpend.remainingToday))})
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-[11px] text-slate-300 truncate">
                  Rata-rata keluar:{" "}
                  <strong className="font-pixel text-[10px] text-slate-200">
                    {formatIDR(safeDailySpend.averageDailyBurn)}/hari
                  </strong>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              className="text-[10px] text-slate-400 hover:text-white font-medium ml-2 shrink-0 underline decoration-slate-600 hover:decoration-white transition-colors"
            >
              Rincian ➔
            </button>
          </div>
        )}
      </div>

      {/* Modal Penjelasan Perhitungan Transparan */}
      {hasSafeDailySpend && (
        <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <DialogTitle className="text-sm font-bold text-slate-900">
                  Cara Hitung Batas Belanja
                </DialogTitle>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dihitung dari sisa dana bulan ini dibagi jumlah hari yang tersisa sampai akhir bulan.
              </p>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>
                    {safeDailySpend.basis === "budget"
                      ? "Target Anggaran Bulan Ini"
                      : "Pemasukan Bulan Ini"}
                  </span>
                  <span className="font-semibold text-slate-900 font-pixel">
                    {formatIDR(safeDailySpend.basisAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Sudah Dibelanjakan Bulan Ini</span>
                  <span className="font-semibold text-rose-600 font-pixel">
                    - {formatIDR(safeDailySpend.totalExpenses)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-800 font-medium">
                  <span>Sisa Dana Tersedia</span>
                  <span className="font-bold text-slate-900 font-pixel">
                    = {formatIDR(safeDailySpend.remainingFunds)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>Sisa Hari Sampai Akhir Bulan</span>
                  <span className="font-semibold text-slate-900 font-pixel">
                    ÷ {safeDailySpend.daysRemaining} Hari
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                  <span>Batas Belanja per Hari</span>
                  <span className="font-pixel text-emerald-600 text-sm">
                    = {formatIDR(safeDailySpend.safeDailyAmount)} / hari
                  </span>
                </div>

                {safeDailySpend.spentToday > 0 && (
                  <>
                    <div className="flex items-center justify-between text-slate-600 pt-1">
                      <span>Pengeluaran Hari Ini</span>
                      <span className="font-semibold text-slate-900 font-pixel">
                        - {formatIDR(safeDailySpend.spentToday)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold">
                      <span className={isOverToday ? "text-rose-700" : "text-slate-900"}>
                        {isOverToday ? "Kelebihan Hari Ini" : "Sisa Jatah Hari Ini"}
                      </span>
                      <span
                        className={`font-pixel text-sm ${
                          isOverToday ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {isOverToday
                          ? `-${formatIDR(Math.abs(safeDailySpend.remainingToday))}`
                          : formatIDR(safeDailySpend.remainingToday)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-amber-950">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Catatan:</span>
                </div>
                <p className="leading-relaxed">
                  Batas harian ini otomatis menyesuaikan setiap hari. Kalau hari ini kamu belanja lebih hemat, jatah belanja untuk besok dan hari-hari berikutnya akan otomatis bertambah.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
