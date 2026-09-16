"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WishlistItem } from "@/types";
import { formatIDR, parseIDRInput } from "@/lib/utils/currency";
import { depositToWishlist } from "@/app/actions/wishlist";
import { Coins, Sparkles } from "lucide-react";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WishlistItem | null;
  onSuccess: (awardedXp?: number, badge?: { title: string; icon: string } | null) => void;
}

const PRESET_AMOUNTS = [10000, 25000, 50000, 100000];

export function DepositModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: DepositModalProps) {
  const [amountStr, setAmountStr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!item) return null;

  const remainingNeeded = Math.max(0, item.target_amount - item.saved_amount);

  const handlePreset = (val: number) => {
    const current = parseIDRInput(amountStr);
    const updated = current + val;
    setAmountStr(updated.toLocaleString("id-ID"));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseIDRInput(amountStr);
    if (amount <= 0) {
      setErrorMsg("Masukkan nominal tabungan minimal Rp 1.000.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await depositToWishlist(item.id, amount);
      if (!res.success) {
        setErrorMsg(res.error || "Gagal menyisihkan uang.");
        return;
      }

      setAmountStr("");
      onClose();
      onSuccess(res.awardedXp, res.unlockedBadge);
    } catch {
      setErrorMsg("Terjadi gangguan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-retro">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-pixel text-sm text-white">
                Tambah Tabungan
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Untuk: <span className="text-emerald-400 font-semibold">{item.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Current status pill */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 block">Terkumpul</span>
            <span className="font-pixel text-emerald-400 font-bold text-xs">
              {formatIDR(item.saved_amount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Kurang</span>
            <span className="font-pixel text-amber-400 font-bold text-xs">
              {formatIDR(remainingNeeded)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Pilihan Cepat
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handlePreset(val)}
                  className="py-1.5 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-[11px] font-pixel text-slate-200 transition-all text-center"
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Nominal Tabungan
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-pixel text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountStr}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/\D/g, "");
                  setAmountStr(numeric ? Number(numeric).toLocaleString("id-ID") : "");
                  setErrorMsg(null);
                }}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-3 text-sm font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-800">
              {errorMsg}
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-pixel text-slate-300 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? "Menyimpan..." : "Simpan (+10 XP)"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
