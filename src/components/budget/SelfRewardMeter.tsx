"use client";

import Link from "next/link";
import { Sparkles, ShieldCheck, AlertTriangle, AlertCircle, ArrowRight } from "lucide-react";
import { SelfRewardAllowance } from "@/types";
import { formatIDR } from "@/lib/utils/currency";

interface SelfRewardMeterProps {
  allowance: SelfRewardAllowance;
}

export function SelfRewardMeter({ allowance }: SelfRewardMeterProps) {
  if (!allowance.configured) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/90 via-rose-50/50 to-white border border-pink-200/80 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Jatah Self-Reward (Uang Jajan Santai)
              </h4>
              <p className="text-[11px] text-slate-500">
                Belanja hobi & jajan tanpa rasa bersalah
              </p>
            </div>
          </div>
          <span className="text-[9px] font-pixel text-pink-600 bg-pink-100 px-2 py-0.5 rounded shrink-0">
            BELUM DIATUR
          </span>
        </div>

        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
          Tentukan batas jajan santaimu bulan ini (nominal tetap atau % dari pemasukan) agar keuanganmu tetap aman dan terkendali.
        </p>

        <Link
          href="/budgets"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 hover:text-pink-700 active:scale-95 transition-all bg-white px-3 py-1.5 rounded-xl border border-pink-200 shadow-xs"
        >
          <span>Atur Budget Self-Reward</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  // Configured state
  const isWarning = allowance.healthStatus === "warning";
  const isOver = allowance.healthStatus === "overbudget";

  const statusConfig = {
    safe: {
      label: "AMAN",
      color: "text-emerald-700 bg-emerald-100 border-emerald-300",
      barColor: "bg-emerald-500",
      icon: ShieldCheck,
      desc: "Uang jajanmu masih dalam batas aman!",
    },
    warning: {
      label: "WASPADA",
      color: "text-amber-700 bg-amber-100 border-amber-300",
      barColor: "bg-amber-500",
      icon: AlertTriangle,
      desc: "Mendekati batas alokasi jajan bulan ini.",
    },
    overbudget: {
      label: "OVERBUDGET",
      color: "text-rose-700 bg-rose-100 border-rose-300",
      barColor: "bg-rose-500",
      icon: AlertCircle,
      desc: "Telah melampaui kuota self-reward bulan ini.",
    },
  }[allowance.healthStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden">
      {/* Top Header with Status Pill */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 tracking-tight">
            JATAH SELF-REWARD
          </span>
        </div>

        <span
          className={`text-[9px] font-pixel px-2 py-0.5 rounded border flex items-center gap-1 ${statusConfig.color}`}
        >
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig.label}</span>
        </span>
      </div>

      {/* Main Remaining Allowance Value */}
      <div className="my-2.5">
        <span className="text-[10px] text-slate-400 font-medium block">
          Sisa Uang Jajan Bebas Rasa Bersalah:
        </span>
        <h3
          className={`text-xl font-bold font-pixel tracking-tight mt-0.5 ${
            isOver ? "text-rose-600" : isWarning ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          {formatIDR(allowance.remainingAllowance)}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mt-3">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${statusConfig.barColor}`}
            style={{ width: `${Math.min(allowance.percentageUsed, 100)}%` }}
          />
        </div>

        {/* Meter Details Text */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>
            Terpakai: <strong>{formatIDR(allowance.totalSpent)}</strong>
          </span>
          <span>
            Limit: <strong>{formatIDR(allowance.effectiveLimit)}</strong> ({allowance.percentageUsed}%)
          </span>
        </div>
      </div>
    </div>
  );
}
