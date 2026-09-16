"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "./CategorySelector";
import { Category } from "@/types";
import { createTransaction } from "@/app/actions/transactions";
import { logNoSpendDay } from "@/app/actions/no-spend";
import { getTodayDateString } from "@/lib/utils/date";
import { formatIDR, parseIDRInput } from "@/lib/utils/currency";
import { enqueueOfflineTransaction } from "@/lib/offline/queue";
import { Flame, Sparkles, Check, WifiOff, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess?: () => void;
}

export function QuickAddModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: QuickAddModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [rawAmount, setRawAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>(getTodayDateString());
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [offlineSaved, setOfflineSaved] = useState<boolean>(false);

  // Gamification celebration popover state
  const [rewardCelebration, setRewardCelebration] = useState<{
    xp: number;
    badge?: { title: string; icon: string } | null;
    isNoSpend?: boolean;
  } | null>(null);

  const handleNoSpendSubmit = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const result = await logNoSpendDay(date);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.error || "Gagal mencatat hari bebas belanja.");
      } else if (result.alreadyLogged) {
        setErrorMsg("Hari ini sudah tercatat sebagai Hari Bebas Belanja.");
      } else {
        setRewardCelebration({
          xp: result.gamification?.awardedXp ?? 10,
          badge: result.gamification?.unlockedBadge,
          isNoSpend: true,
        });

        setTimeout(() => {
          setRewardCelebration(null);
          resetForm();
          onClose();
          onSuccess?.();
        }, 1800);
      }
    } catch {
      setLoading(false);
      setErrorMsg("Terjadi kesalahan saat mencatat.");
    }
  };

  // Filter categories by active type (expense or income)
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsed = parseIDRInput(val);
    setRawAmount(parsed > 0 ? String(parsed) : "");
  };

  const addQuickNominal = (additional: number) => {
    const current = parseIDRInput(rawAmount);
    setRawAmount(String(current + additional));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseIDRInput(rawAmount);

    if (amountNum <= 0) {
      setErrorMsg("Masukkan nominal yang valid");
      return;
    }

    if (!categoryId) {
      setErrorMsg("Pilih salah satu kategori");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // If device is currently offline, queue transaction to IndexedDB
    if (typeof window !== "undefined" && !navigator.onLine) {
      const cat = categories.find((c) => c.id === categoryId);
      await enqueueOfflineTransaction({
        amount: amountNum,
        type,
        categoryId,
        categoryName: cat?.name,
        date,
        note: note.trim() || null,
      });

      window.dispatchEvent(new Event("story_finance_offline_queued"));

      setLoading(false);
      setOfflineSaved(true);
      setTimeout(() => {
        setOfflineSaved(false);
        resetForm();
        onClose();
        onSuccess?.();
      }, 1600);
      return;
    }

    try {
      const result = await createTransaction({
        amount: amountNum,
        type,
        categoryId,
        date,
        note: note.trim() || null,
      });

      setLoading(false);

      if (!result.success) {
        setErrorMsg(result.error || "Gagal mencatat transaksi");
      } else {
        // Trigger celebration if XP or badge unlocked
        if (result.gamification?.awardedXp || result.gamification?.unlockedBadge) {
          setRewardCelebration({
            xp: result.gamification.awardedXp,
            badge: result.gamification.unlockedBadge,
          });

          setTimeout(() => {
            setRewardCelebration(null);
            resetForm();
            onClose();
            onSuccess?.();
          }, 1800);
        } else {
          resetForm();
          onClose();
          onSuccess?.();
        }
      }
    } catch {
      // Network failed during request -> fallback to offline queue
      const cat = categories.find((c) => c.id === categoryId);
      await enqueueOfflineTransaction({
        amount: amountNum,
        type,
        categoryId,
        categoryName: cat?.name,
        date,
        note: note.trim() || null,
      });

      window.dispatchEvent(new Event("story_finance_offline_queued"));

      setLoading(false);
      setOfflineSaved(true);
      setTimeout(() => {
        setOfflineSaved(false);
        resetForm();
        onClose();
        onSuccess?.();
      }, 1600);
    }
  };

  const resetForm = () => {
    setRawAmount("");
    setCategoryId(null);
    setNote("");
    setDate(getTodayDateString());
    setErrorMsg(null);
    setRewardCelebration(null);
    setOfflineSaved(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] p-5 rounded-2xl">
        <DialogHeader className="pb-2 pr-8 text-left">
          <DialogTitle className="text-xs font-pixel tracking-wider text-slate-800">
            CATAT TRANSAKSI
          </DialogTitle>
        </DialogHeader>

        {offlineSaved ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <WifiOff className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">
              Tersimpan di Perangkat!
            </h4>
            <p className="text-xs text-slate-500 max-w-[260px] mx-auto leading-relaxed">
              Kamu sedang offline. Transaksi ini akan otomatis terkirim saat internetmu kembali menyala.
            </p>
          </div>
        ) : rewardCelebration ? (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div
              className={cn(
                "w-16 h-16 rounded-2xl border-2 border-slate-900 shadow-retro flex items-center justify-center mb-3 animate-bounce",
                rewardCelebration.isNoSpend ? "bg-emerald-400" : "bg-amber-400"
              )}
            >
              {rewardCelebration.isNoSpend ? (
                <ShieldCheck className="w-9 h-9 text-slate-950 fill-emerald-200" />
              ) : (
                <Flame className="w-9 h-9 text-slate-950 fill-amber-300" />
              )}
            </div>
            <h4 className="font-pixel text-xs text-slate-900 mb-1 uppercase">
              {rewardCelebration.isNoSpend ? "Hari Bebas Belanja" : "Transaksi Tercatat"}
            </h4>
            <p className="text-xs text-emerald-600 font-bold mb-2">
              {rewardCelebration.isNoSpend
                ? `Rp 0 keluar hari ini. Streak aman & +${rewardCelebration.xp} XP!`
                : `+${rewardCelebration.xp} XP didapatkan!`}
            </p>
            {rewardCelebration.badge && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Badge Baru: <strong>{rewardCelebration.badge.title}</strong>!</span>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Type Selector Toggle: Pengeluaran vs Pemasukan */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  setCategoryId(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === "expense"
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setCategoryId(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  type === "income"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pemasukan
              </button>
            </div>

            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Nominal (Rp)</label>
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={rawAmount ? formatIDR(parseInt(rawAmount, 10)) : ""}
                  onChange={handleAmountChange}
                  className="text-lg font-bold pl-3 h-12"
                  autoFocus
                  required
                />
              </div>
              {/* Quick Nominal Pills for Fast Tap */}
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                {[10000, 25000, 50000, 100000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => addQuickNominal(nominal)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap active:scale-95 transition-transform"
                  >
                    +{nominal / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Pilih Kategori</label>
              <CategorySelector
                categories={filteredCategories}
                selectedId={categoryId}
                onSelect={(id) => setCategoryId(id)}
              />
            </div>

            {/* Note & Date */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Catatan (Opsional)</label>
                <Input
                  type="text"
                  placeholder="Misal: Jajan boba"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-xs h-9"
                  maxLength={100}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">Tanggal</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className={`w-full font-bold h-11 ${
                type === "expense"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Simpan Transaksi
                </span>
              )}
            </Button>

            {/* No-Spend Day Fast Option */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleNoSpendSubmit}
                disabled={loading}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 active:scale-[0.99] text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Hari ini tidak jajan / pengeluaran Rp 0</span>
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
