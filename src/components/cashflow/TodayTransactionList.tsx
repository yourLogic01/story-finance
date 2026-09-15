"use client";

import { TransactionWithCategory } from "@/types";
import { formatIDR } from "@/lib/utils/currency";
import { ReceiptText } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TodayTransactionListProps {
  transactions: TransactionWithCategory[];
}

export function TodayTransactionList({ transactions }: TodayTransactionListProps) {
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
        <span className="text-xs font-bold text-slate-900 font-pixel">
          {formatIDR(totalExpenseToday)}
        </span>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Belum ada transaksi hari ini.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Ketuk tombol (+) di bawah untuk mencatat.
            </p>
          </div>
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
                    className={`text-xs font-bold block ${
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
