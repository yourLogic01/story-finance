"use client";

import { PieChart } from "lucide-react";
import { formatIDR } from "@/lib/utils/currency";
import { getCategoryIcon } from "@/lib/utils/icons";
import { MonthlySummary } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryBreakdownProps {
  breakdowns: MonthlySummary["categoryBreakdowns"];
  totalExpenses: number;
}

export function CategoryBreakdown({
  breakdowns,
  totalExpenses,
}: CategoryBreakdownProps) {
  return (
    <Card className="border border-slate-200/80 shadow-sm overflow-hidden">
      <CardHeader className="py-3.5 px-4 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-emerald-600" />
          <span>Pengeluaran per Kategori</span>
        </CardTitle>
        <span className="text-xs font-bold text-slate-900 font-pixel">
          {formatIDR(totalExpenses)}
        </span>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {breakdowns.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Belum ada catatan pengeluaran bulan ini.
            </p>
          </div>
        ) : (
          breakdowns.map((item) => {
            const Icon = getCategoryIcon(item.category.icon);
            const color = item.category.color || "#10B981";

            return (
              <div key={item.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800">
                      {item.category.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">
                      {formatIDR(item.totalAmount)}
                    </span>
                    <span className="text-[10px] font-pixel text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.percentageOfTotal}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(item.percentageOfTotal, 100)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
