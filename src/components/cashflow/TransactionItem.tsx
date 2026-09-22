"use client";

import { TransactionWithCategory } from "@/types";
import { formatIDR } from "@/lib/utils/currency";
import { getCategoryIcon } from "@/lib/utils/icons";
import { Pencil, Trash2 } from "lucide-react";

interface TransactionItemProps {
  transaction: TransactionWithCategory;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  isDeleting = false,
}: TransactionItemProps) {
  const Icon = getCategoryIcon(transaction.category?.icon);
  const color = transaction.category?.color || "#10B981";
  const isExpense = transaction.type === "expense";

  return (
    <div
      className={`flex items-center justify-between p-3.5 hover:bg-slate-50/80 transition-all group ${
        isDeleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Left: Category Icon & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
          style={{
            backgroundColor: `${color}18`,
            color: color,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-800 truncate">
              {transaction.category?.name || "Lainnya"}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                isExpense
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}
            >
              {isExpense ? "Keluar" : "Masuk"}
            </span>
          </div>
          {transaction.note && (
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {transaction.note}
            </p>
          )}
        </div>
      </div>

      {/* Right: Nominal & Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-xs font-bold font-pixel tracking-tight privacy-mask ${
            isExpense ? "text-slate-900" : "text-emerald-600"
          }`}
        >
          {isExpense ? "-" : "+"}
          {formatIDR(transaction.amount)}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 ml-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            aria-label="Edit Transaksi"
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction.id)}
            aria-label="Hapus Transaksi"
            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
