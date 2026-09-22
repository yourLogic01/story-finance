"use client";

import Link from "next/link";
import { Wallet, ArrowRight } from "lucide-react";
import { SelfRewardAllowance } from "@/types";
import { formatIDR } from "@/lib/utils/currency";

interface SelfRewardMeterProps {
  allowance: SelfRewardAllowance;
}

export function SelfRewardMeter({ allowance }: SelfRewardMeterProps) {
  if (!allowance.configured) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Budget Self-Reward</span>
          </div>
          <span className="text-[9px] font-pixel text-emerald-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            BELUM DIATUR
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Tentukan batas anggaran bulanan untuk jajan dan hiburan agar pengeluaran tetap terkontrol.
        </p>

        <div>
          <Link
            href="/budgets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition-colors"
          >
            <span>Atur Budget</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Configured state
  const isWarning = allowance.healthStatus === "warning";
  const isOver = allowance.healthStatus === "overbudget";

  const statusConfig = {
    safe: {
      label: "Aman",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      barColor: "bg-emerald-500",
    },
    warning: {
      label: "Waspada",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      barColor: "bg-amber-500",
    },
    overbudget: {
      label: "Overbudget",
      color: "text-rose-700 bg-rose-50 border-rose-200",
      barColor: "bg-rose-500",
    },
  }[allowance.healthStatus];

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-800">Budget Self-Reward</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusConfig.color}`}
          >
            {statusConfig.label}
          </span>
          <Link
            href="/budgets"
            className="text-[11px] text-slate-400 hover:text-slate-600 underline"
          >
            Ubah
          </Link>
        </div>
      </div>

      {/* Main Remaining Allowance */}
      <div>
        <span className="text-[11px] text-slate-400 block">Sisa anggaran:</span>
        <h3
          className={`text-xl font-bold font-pixel tracking-tight mt-0.5 ${
            isOver ? "text-rose-600" : isWarning ? "text-amber-600" : "text-slate-900"
          }`}
        >
          <span className="privacy-mask">{formatIDR(allowance.remainingAllowance)}</span>
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${statusConfig.barColor}`}
            style={{ width: `${Math.min(allowance.percentageUsed, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Terpakai: <strong className="privacy-mask">{formatIDR(allowance.totalSpent)}</strong>
          </span>
          <span>
            Batas: <strong className="privacy-mask">{formatIDR(allowance.effectiveLimit)}</strong> (
            {allowance.percentageUsed}%)
          </span>
        </div>
      </div>
    </div>
  );
}
