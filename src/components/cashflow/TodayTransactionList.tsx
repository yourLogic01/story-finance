"use client";

import { TransactionWithCategory } from "@/types";
import { formatIDR } from "@/lib/utils/currency";
import { ReceiptText, ShieldCheck } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TodayTransactionListProps {
  transactions: TransactionWithCategory[];
  isNoSpendToday?: boolean;
  onMarkNoSpend?: () => void;
  onCancelNoSpend?: () => void;
  isNoSpendLoading?: boolean;
}

export function TodayTransactionList({
  transactions,
  isNoSpendToday = false,
  onMarkNoSpend,
  onCancelNoSpend,
  isNoSpendLoading = false,
}: TodayTransactionListProps) {
  const totalExpenseToday = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <CardHeader className="py-3.5 px-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <ReceiptText className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pengeluaran Hari Ini</span>
        </CardTitle>
        <span className="text-xs font-bold text-slate-900 font-pixel privacy-mask">
          {isNoSpendToday && totalExpenseToday === 0
            ? "Rp 0 (Bebas Belanja)"
            : formatIDR(totalExpenseToday)}
        </span>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {transactions.length === 0 ? (
          isNoSpendToday ? (
            <div className="p-5 text-center bg-emerald-50/50 flex flex-col items-center justify-center space-y-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-6 h-6 text-emerald-100" />
              </div>
              <div>
                <h4 className="font-pixel text-xs text-emerald-950 font-bold">
                  HARI BEBAS BELANJA
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5 max-w-[260px] mx-auto leading-relaxed">
                  Mantap, hari ini dompet aman tanpa pengeluaran sama sekali.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-pixel text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
                  Streak Aman • +XP
                </span>
                {onCancelNoSpend && (
                  <button
                    type="button"
                    onClick={onCancelNoSpend}
                    disabled={isNoSpendLoading}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline transition-colors"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-5 text-center space-y-3">
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  Belum ada transaksi hari ini.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ketuk tombol (+) di bawah untuk mencatat.
                </p>
              </div>
              {onMarkNoSpend && (
                <button
                  type="button"
                  onClick={onMarkNoSpend}
                  disabled={isNoSpendLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 active:scale-95 text-emerald-800 text-[11px] font-semibold transition-all shadow-2xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {isNoSpendLoading
                      ? "Menandai..."
                      : "Tandai hari ini tidak jajan (Rp 0)"}
                  </span>
                </button>
              )}
            </div>
          )
        ) : (
          transactions.map((tx) => {
            const IconComp = getCategoryIcon(tx.category?.icon);
            const isExpense = tx.type === "expense";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${tx.category?.color || "#10B981"}15`,
                      color: tx.category?.color || "#10B981",
                    }}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900 leading-tight">
                      {tx.category?.name || "Lainnya"}
                    </h5>
                    {tx.note && (
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {tx.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold block privacy-mask ${
                      isExpense ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {isExpense ? "-" : "+"}
                    {formatIDR(Number(tx.amount))}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
