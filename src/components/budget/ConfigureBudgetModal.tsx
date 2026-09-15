"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, BudgetMode } from "@/types";
import { upsertBudget } from "@/app/actions/budgets";
import { formatIDR, parseIDRInput } from "@/lib/utils/currency";

interface ConfigureBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialCategory?: Category | null;
  year: number;
  month: number;
  onSuccess?: () => void;
}

export function ConfigureBudgetModal({
  isOpen,
  onClose,
  categories,
  initialCategory,
  year,
  month,
  onSuccess,
}: ConfigureBudgetModalProps) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [calculationMode, setCalculationMode] = useState<BudgetMode>("fixed");
  const [rawTargetValue, setRawTargetValue] = useState<string>("");
  const [percentageValue, setPercentageValue] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialCategory) {
      setCategoryId(initialCategory.id);
    } else if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [initialCategory, categories, categoryId]);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let targetValue = 0;
    if (calculationMode === "fixed") {
      targetValue = parseIDRInput(rawTargetValue);
      if (targetValue <= 0) {
        setErrorMsg("Masukkan nominal anggaran yang valid");
        return;
      }
    } else {
      const p = parseFloat(percentageValue);
      if (isNaN(p) || p <= 0 || p > 100) {
        setErrorMsg("Persentase harus berada di antara 1% dan 100%");
        return;
      }
      targetValue = p;
    }

    setLoading(true);
    const result = await upsertBudget({
      categoryId: categoryId || undefined,
      month,
      year,
      calculationMode,
      targetValue,
    });
    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || "Gagal menyimpan anggaran.");
    } else {
      onClose();
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] p-5 rounded-2xl">
        <DialogHeader className="pb-2 pr-8 text-left">
          <DialogTitle className="text-xs font-pixel tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ATUR ANGGARAN</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Pilih Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Toggle: Fixed vs Percentage */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Metode Perhitungan
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setCalculationMode("fixed")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  calculationMode === "fixed"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Nominal Tetap (Rp)
              </button>
              <button
                type="button"
                onClick={() => setCalculationMode("percentage")}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  calculationMode === "percentage"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Persentase (%)
              </button>
            </div>
          </div>

          {/* Input Value */}
          {calculationMode === "fixed" ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Batas Anggaran (Rp)
              </label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 1.000.000"
                value={
                  rawTargetValue
                    ? formatIDR(parseInt(rawTargetValue, 10))
                    : ""
                }
                onChange={(e) => {
                  const val = e.target.value;
                  const parsed = parseIDRInput(val);
                  setRawTargetValue(parsed > 0 ? String(parsed) : "");
                }}
                className="text-base font-bold pl-3 h-11"
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Persentase dari Pemasukan Bulan Ini (%)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="10"
                  value={percentageValue}
                  onChange={(e) => setPercentageValue(e.target.value)}
                  className="text-base font-bold pl-3 pr-8 h-11"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  %
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Limit nominal akan otomatis mengikuti total pemasukan yang kamu catat di bulan ini.
              </p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-xs font-bold rounded-xl mt-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {loading ? "Menyimpan..." : "Simpan Anggaran"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
