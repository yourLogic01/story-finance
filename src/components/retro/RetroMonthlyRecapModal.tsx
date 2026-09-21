"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { MonthlyRecapData } from "@/app/actions/recap";
import { formatIDR } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  PiggyBank,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Download,
} from "lucide-react";
import { generateMonthlyPdf } from "@/lib/export/generateMonthlyPdf";

interface RetroMonthlyRecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  recapData: MonthlyRecapData | null;
}

export function RetroMonthlyRecapModal({
  isOpen,
  onClose,
  recapData,
}: RetroMonthlyRecapModalProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  const handleDownloadPdf = () => {
    if (!recapData || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      generateMonthlyPdf(recapData);
    } catch (err) {
      console.error("Gagal men-download PDF:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  if (!recapData) return null;

  const totalSlides = 3;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-0 overflow-hidden border-2 border-slate-900 shadow-retro rounded-2xl max-h-[90vh] flex flex-col bg-slate-900 text-white">
        {/* Retro CRT Scanline Top Bar */}
        <div className="px-4 pr-12 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <DialogHeader className="p-0 space-y-0 text-left">
            <DialogTitle className="font-pixel text-xs tracking-wider text-emerald-400 uppercase">
              REKAPAN BULANAN
            </DialogTitle>
            <DialogDescription className="text-[10px] text-slate-400">
              {recapData.monthName}
            </DialogDescription>
          </DialogHeader>

          {/* Slide Indicator Dots & Direct PDF Download Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              title="Download Laporan PDF"
              className="p-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800 text-[9px] font-pixel flex items-center gap-1 transition-all disabled:opacity-50"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span>{isDownloadingPdf ? "..." : "PDF"}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-full border border-slate-800">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentSlide === idx
                      ? "w-4 bg-emerald-400"
                      : "bg-slate-700 hover:bg-slate-600"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Slide Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 min-h-[330px]">
          {/* ======================================================= */}
          {/* SLIDE 1: KONSISTENSI & HARI BEBAS BELANJA */}
          {/* ======================================================= */}
          {currentSlide === 0 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-wide block">
                    Konsistensi Catatan
                  </span>
                  <h3 className="text-sm font-bold text-white font-pixel">
                    {recapData.habitTitle}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold font-pixel text-emerald-400">
                    {recapData.consistencyRate}%
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-1">
                    Aktif
                  </span>
                </div>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Mencatat</span>
                  </div>
                  <span className="text-sm font-bold font-pixel text-white block">
                    {recapData.normalLoggedDaysCount} Hari
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Bebas Belanja</span>
                  </div>
                  <span className="text-sm font-bold font-pixel text-emerald-400 block">
                    {recapData.noSpendDaysCount} Hari
                  </span>
                </div>
              </div>

              {/* Mini Pixel Heatmap */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-pixel">
                  <span>KALENDER CATATAN</span>
                  <span>{recapData.totalLoggedDays} / {recapData.daysPassed} hari</span>
                </div>

                <div className="grid grid-cols-7 gap-1 pt-1">
                  {recapData.daysHeatmap.map((item) => (
                    <div
                      key={item.day}
                      title={`Tgl ${item.day}: ${
                        item.status === "no_spend"
                          ? "Bebas Belanja (Rp 0)"
                          : item.status === "logged"
                          ? `Ada transaksi (${formatIDR(item.expenseAmount)})`
                          : item.status === "future"
                          ? "Mendatang"
                          : "Kosong"
                      }`}
                      className={cn(
                        "h-6 rounded-md flex items-center justify-center font-pixel text-[9px] transition-transform select-none",
                        item.status === "no_spend" &&
                          "bg-sky-500/90 text-white font-bold ring-1 ring-sky-300 shadow-2xs",
                        item.status === "logged" &&
                          "bg-emerald-500 text-white font-bold",
                        item.status === "missed" &&
                          "bg-slate-800/80 text-slate-500",
                        item.status === "future" &&
                          "border border-dashed border-slate-800 text-slate-700"
                      )}
                    >
                      {item.day}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-3 pt-1 text-[9px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    <span>Mencatat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-sky-500" />
                    <span>Bebas Belanja</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-slate-800" />
                    <span>Kosong</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SLIDE 2: ARUS KAS & PERBANDINGAN BULAN LALU */}
          {/* ======================================================= */}
          {currentSlide === 1 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-wide block">
                  Arus Kas Bulanan
                </span>
                <h3 className="text-sm font-bold text-white font-pixel">
                  Bulan Ini vs Bulan Lalu
                </h3>
              </div>

              {/* Income vs Expense Cards */}
              <div className="space-y-2">
                {/* Total Pemasukan */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        Total Pemasukan
                      </span>
                      <span className="text-xs font-bold text-emerald-400 font-pixel">
                        {formatIDR(recapData.totalIncome)}
                      </span>
                    </div>
                  </div>

                  {recapData.incomeDiffPercent !== null && (
                    <span
                      className={cn(
                        "text-[10px] font-pixel px-1.5 py-0.5 rounded",
                        recapData.incomeDiffPercent >= 0
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      )}
                    >
                      {recapData.incomeDiffPercent >= 0 ? "+" : ""}
                      {recapData.incomeDiffPercent}%
                    </span>
                  )}
                </div>

                {/* Total Pengeluaran */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        Total Pengeluaran
                      </span>
                      <span className="text-xs font-bold text-rose-400 font-pixel">
                        {formatIDR(recapData.totalExpenses)}
                      </span>
                    </div>
                  </div>

                  {recapData.expenseDiffPercent !== null && (
                    <span
                      className={cn(
                        "text-[10px] font-pixel px-1.5 py-0.5 rounded",
                        recapData.isExpenseLower
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-rose-950 text-rose-400 border border-rose-800"
                      )}
                    >
                      {recapData.expenseDiffPercent >= 0 ? "+" : ""}
                      {recapData.expenseDiffPercent}%
                      {recapData.isExpenseLower ? " (Lebih Hemat)" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Saving Rate & Top Category */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
                    <PiggyBank className="w-3.5 h-3.5 text-purple-400" />
                    <span>Rasio Tabungan</span>
                  </div>
                  <span className="text-sm font-bold font-pixel text-purple-300 block">
                    {recapData.savingsRate}%
                  </span>
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    Sisa: {formatIDR(recapData.netSavings)}
                  </span>
                </div>

                {recapData.topExpenseCategory ? (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 block truncate">
                      Pengeluaran Terbesar
                    </span>
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {recapData.topExpenseCategory.name}
                    </span>
                    <span className="text-[10px] font-pixel text-rose-400 block leading-tight">
                      {formatIDR(recapData.topExpenseCategory.amount)} ({recapData.topExpenseCategory.percentage}%)
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500">
                      Belum ada pengeluaran
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* SLIDE 3: SMART FORECAST & ESTIMASI AKHIR BULAN */}
          {/* ======================================================= */}
          {currentSlide === 2 && (
            <div className="space-y-3.5 animate-in fade-in-50 duration-200">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-wide block">
                  Perkiraan & Anggaran
                </span>
                <h3 className="text-sm font-bold text-white font-pixel">
                  Perkiraan Akhir Bulan
                </h3>
              </div>

              {/* Projection Card */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Rata-rata Harian
                  </span>
                  <span className="text-xs font-bold font-pixel text-amber-400">
                    {formatIDR(recapData.dailyBurnRate)} / hari
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {recapData.isCurrentMonth
                        ? "Estimasi Pengeluaran Akhir Bulan"
                        : "Total Akhir Bulan"}
                    </span>
                    <span className="text-sm font-bold font-pixel text-white block mt-0.5">
                      {formatIDR(recapData.projectedExpense)}
                    </span>
                  </div>

                  {/* Budget Status Badge */}
                  {recapData.budgetStatus === "safe" && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-pixel font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>AMAN</span>
                    </div>
                  )}
                  {recapData.budgetStatus === "warning" && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-pixel font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>MEPET</span>
                    </div>
                  )}
                  {recapData.budgetStatus === "danger" && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-pixel font-bold">
                      <AlertOctagon className="w-3 h-3" />
                      <span>LEWAT BUDGET</span>
                    </div>
                  )}
                </div>

                {recapData.totalBudget !== null && recapData.totalBudget > 0 && (
                  <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                    <span>Batas Anggaran Bulan Ini:</span>
                    <span className="font-pixel text-slate-300 font-bold">
                      {formatIDR(recapData.totalBudget)}
                    </span>
                  </div>
                )}
              </div>

              {/* Human Grounded Advice */}
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 flex items-start gap-2.5 text-slate-300 text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  {recapData.summaryAdvice}
                </p>
              </div>

              {/* Action: Direct 1-Click Download PDF */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isDownloadingPdf ? "Menyiapkan PDF..." : "Download Laporan PDF"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Retro Bottom Navigation Controls */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSlide === 0}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-xs font-pixel flex items-center gap-1 transition-all active:scale-95",
              currentSlide === 0
                ? "border-slate-800 text-slate-600 cursor-not-allowed opacity-40"
                : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Mundur</span>
          </button>

          <span className="text-[10px] font-pixel text-slate-500">
            {currentSlide + 1} / {totalSlides}
          </span>

          <button
            type="button"
            onClick={handleNext}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center gap-1 transition-all shadow-xs"
          >
            <span>{currentSlide === totalSlides - 1 ? "Selesai" : "Lanjut"}</span>
            <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
