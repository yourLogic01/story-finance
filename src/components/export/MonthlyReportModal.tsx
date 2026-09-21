"use client";

import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MonthlyRecapData } from "@/app/actions/recap";
import { formatIDR } from "@/lib/utils/currency";
import {
  Printer,
  FileText,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Target,
  Sparkles,
  Gift,
} from "lucide-react";

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  recapData: MonthlyRecapData | null;
}

export function MonthlyReportModal({
  isOpen,
  onClose,
  recapData,
}: MonthlyReportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!recapData) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[calc(100%-1.5rem)] p-0 bg-slate-900 border border-slate-800 text-white rounded-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Header with Action Buttons */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-xs font-pixel text-white">
                Laporan Keuangan Bulanan
              </DialogTitle>
              <DialogDescription className="text-[11px] text-slate-400">
                {recapData.monthName} • Siap dicetak atau disimpan sebagai PDF
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900/60">
          <div
            id="printable-monthly-report"
            ref={printRef}
            className="bg-white text-slate-900 p-6 md:p-8 rounded-xl shadow-lg border border-slate-200 font-sans space-y-6 text-xs"
          >
            {/* 1. DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-sm font-bold text-slate-900 tracking-tight">
                    STORY FINANCE
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium border border-slate-300">
                    Laporan Bulanan
                  </span>
                </div>
                <h1 className="text-lg font-bold text-slate-900 mt-1">
                  Rekap Keuangan & Evaluasi Anggaran
                </h1>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Periode: <strong className="text-slate-800">{recapData.monthName}</strong>
                </p>
              </div>

              <div className="sm:text-right text-[11px] text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  Pengguna: <strong className="text-slate-900">{recapData.userDisplayName}</strong>
                </div>
                {recapData.userEmail && (
                  <div className="text-[10px] text-slate-500">{recapData.userEmail}</div>
                )}
                <div className="text-[10px] text-slate-400 pt-0.5">
                  Tanggal Cetak: {currentDate}
                </div>
              </div>
            </div>

            {/* 2. CASHFLOW SUMMARY CARDS */}
            <div>
              <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Ringkasan Arus Kas & Tabungan</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 block">Total Pemasukan</span>
                  <span className="text-sm font-bold text-emerald-700 font-mono block mt-0.5">
                    {formatIDR(recapData.totalIncome)}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 block">Total Pengeluaran</span>
                  <span className="text-sm font-bold text-rose-700 font-mono block mt-0.5">
                    {formatIDR(recapData.totalExpenses)}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 block">Sisa Dana (Net)</span>
                  <span
                    className={`text-sm font-bold font-mono block mt-0.5 ${
                      recapData.netSavings >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {formatIDR(recapData.netSavings)}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 block">Rasio Tabungan</span>
                  <span className="text-sm font-bold text-blue-700 font-mono block mt-0.5">
                    {recapData.savingsRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* 3. HABIT & CONSISTENCY */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block">Konsistensi Mencatat</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                  {recapData.totalLoggedDays} dari {recapData.daysPassed} hari ({recapData.consistencyRate}%)
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Hari Tanpa Belanja (Rp 0)</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{recapData.noSpendDaysCount} hari</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block">Pos Pengeluaran Terbesar</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                  {recapData.topExpenseCategory
                    ? `${recapData.topExpenseCategory.name} (${formatIDR(recapData.topExpenseCategory.amount)} • ${recapData.topExpenseCategory.percentage}%)`
                    : "Belum ada pengeluaran"}
                </span>
              </div>
            </div>

            {/* 4. BUDGET BREAKDOWN TABLE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>2. Realisasi Anggaran per Kategori</span>
                </h2>
                {recapData.totalBudget !== null && recapData.totalBudget > 0 && (
                  <span className="text-[10px] text-slate-500">
                    Batas Total: <strong className="text-slate-800">{formatIDR(recapData.totalBudget)}</strong>
                  </span>
                )}
              </div>

              {recapData.budgetBreakdowns && recapData.budgetBreakdowns.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">Kategori</th>
                        <th className="py-2 px-3 text-right">Batas Anggaran</th>
                        <th className="py-2 px-3 text-right">Realisasi</th>
                        <th className="py-2 px-3 text-right">Sisa</th>
                        <th className="py-2 px-3 text-right">Pemakaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recapData.budgetBreakdowns.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{b.categoryName}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {formatIDR(b.targetAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-800 font-semibold">
                            {formatIDR(b.spentAmount)}
                          </td>
                          <td
                            className={`py-2 px-3 text-right font-mono ${
                              b.remainingAmount > 0 ? "text-emerald-700" : "text-slate-500"
                            }`}
                          >
                            {formatIDR(b.remainingAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                b.percentageUsed > 100
                                  ? "bg-rose-100 text-rose-800"
                                  : b.percentageUsed >= 85
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {b.percentageUsed}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-slate-300 text-slate-500 text-[11px] text-center">
                  Belum ada batasan anggaran khusus yang diatur pada periode ini.
                </div>
              )}
            </div>

            {/* 5. SELF-REWARD METER */}
            <div>
              <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>3. Alokasi Belanja Apresiasi Diri (Self-Reward)</span>
              </h2>
              {recapData.selfReward && (recapData.selfReward.configured || recapData.selfReward.spent > 0) ? (
                <div className="p-3 rounded-lg border border-slate-200 bg-amber-50/40 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Batas Alokasi</span>
                    <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">
                      {recapData.selfReward.configured ? formatIDR(recapData.selfReward.limit) : "Fleksibel"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Terpakai Bulan Ini</span>
                    <span className="text-xs font-bold font-mono text-amber-700 mt-0.5 block">
                      {formatIDR(recapData.selfReward.spent)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Sisa Alokasi Aman</span>
                    <span className="text-xs font-bold font-mono text-emerald-700 mt-0.5 block">
                      {recapData.selfReward.configured
                        ? formatIDR(recapData.selfReward.remaining)
                        : "-"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">Persentase Kuota</span>
                    <span className="text-xs font-bold font-mono text-slate-800 mt-0.5 block">
                      {recapData.selfReward.configured
                        ? `${recapData.selfReward.percentageUsed}%`
                        : "Sesuai kebutuhan"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-slate-300 text-slate-500 text-[11px]">
                  Tidak ada pengeluaran atau batasan anggaran khusus untuk pos Self-Reward pada bulan ini.
                </div>
              )}
            </div>

            {/* 6. WISHLIST BAG (CELENGAN VIRTUAL) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-teal-600" />
                  <span>4. Celengan Virtual & Barang Impian (Wishlist)</span>
                </h2>
                {recapData.wishlist && (
                  <span className="text-[10px] text-slate-500">
                    Total Tabungan Tersimpan: <strong className="text-emerald-700">{formatIDR(recapData.wishlist.totalSaved)}</strong>
                  </span>
                )}
              </div>

              {recapData.wishlist && recapData.wishlist.activeItems.length > 0 ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-2.5">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
                        <th className="py-2 px-3">Nama Barang Impian</th>
                        <th className="py-2 px-3 text-right">Target Harga</th>
                        <th className="py-2 px-3 text-right">Terkumpul</th>
                        <th className="py-2 px-3 text-right">Progres</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recapData.wishlist.activeItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-medium text-slate-800">{item.name}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {formatIDR(item.targetAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 font-semibold">
                            {formatIDR(item.savedAmount)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">
                            {item.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 rounded-lg border border-dashed border-slate-300 text-slate-500 text-[11px] mb-2.5">
                  Belum ada barang impian yang sedang ditabung aktif.
                </div>
              )}

              {/* Purchased this month */}
              {recapData.wishlist && recapData.wishlist.purchasedItemsThisMonth.length > 0 && (
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Barang impian berhasil ditebus bulan ini:</span>
                  </div>
                  <div className="space-x-2 font-mono text-emerald-800 font-bold">
                    {recapData.wishlist.purchasedItemsThisMonth.map((p, idx) => (
                      <span key={idx}>
                        {p.name} ({formatIDR(p.amount)})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 7. EVALUATION NOTE */}
            <div className="p-3.5 rounded-lg bg-slate-50 border-l-4 border-emerald-500 space-y-1">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide block">
                Catatan Evaluasi Bulanan
              </span>
              <p className="text-slate-700 text-[11px] leading-relaxed">
                {recapData.summaryAdvice}
              </p>
            </div>

            {/* 8. DOCUMENT FOOTER */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Story Finance — Aplikasi Pencatat Keuangan Sederhana</span>
              <span>Dokumen dibuat secara otomatis</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar with Close and Print Buttons */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0 no-print">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-pixel text-slate-300 transition-all"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
