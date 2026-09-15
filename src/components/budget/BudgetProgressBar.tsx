"use client";

import { BudgetWithSpending } from "@/app/actions/budgets";
import { formatIDR } from "@/lib/utils/currency";
import { getCategoryIcon } from "@/lib/utils/icons";
import { Tag } from "lucide-react";

interface BudgetProgressBarProps {
  budget: BudgetWithSpending;
}

export function BudgetProgressBar({ budget }: BudgetProgressBarProps) {
  const Icon = budget.category ? getCategoryIcon(budget.category.icon) : Tag;
  const color = budget.category?.color || "#10B981";
  const isOver = budget.spent > budget.effective_limit;
  const isNearLimit = !isOver && budget.percentage_used >= 80;

  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700";

  if (isOver) {
    barColor = "bg-rose-500";
    textColor = "text-rose-600";
  } else if (isNearLimit) {
    barColor = "bg-amber-500";
    textColor = "text-amber-600";
  }

  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
      {/* Category header & Limit Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: `${color}18`,
              color: color,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-slate-800 truncate">
              {budget.category?.name || "Anggaran Global"}
            </h4>
            <span className="text-[10px] text-slate-400 font-medium block">
              {budget.calculation_mode === "percentage"
                ? `${budget.target_value}% dari Pemasukan`
                : "Nominal Tetap"}
            </span>
          </div>
        </div>

        {/* Percentage badge */}
        <span
          className={`text-[10px] font-pixel px-2 py-0.5 rounded border ${
            isOver
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : isNearLimit
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-emerald-50 text-emerald-700 border-emerald-200"
          }`}
        >
          {budget.percentage_used}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.min(budget.percentage_used, 100)}%` }}
        />
      </div>

      {/* Financial Details */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-slate-500 text-[11px]">
          Terpakai: <strong>{formatIDR(budget.spent)}</strong> / {formatIDR(budget.effective_limit)}
        </span>

        <span className={`text-[11px] font-bold ${textColor}`}>
          {isOver
            ? `Over: ${formatIDR(budget.spent - budget.effective_limit)}`
            : `Sisa: ${formatIDR(budget.remaining)}`}
        </span>
      </div>
    </div>
  );
}
