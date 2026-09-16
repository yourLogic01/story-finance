"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Category, WishlistItem } from "@/types";
import { formatIDR } from "@/lib/utils/currency";
import { purchaseWishlistItem } from "@/app/actions/wishlist";
import { Gift, Trophy, Sparkles } from "lucide-react";

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WishlistItem | null;
  categories: Category[];
  onSuccess: (awardedXp?: number, badge?: { title: string; icon: string } | null) => void;
}

export function RedeemModal({
  isOpen,
  onClose,
  item,
  categories,
  onSuccess,
}: RedeemModalProps) {
  const [categoryId, setCategoryId] = useState<string>(
    item?.category_id || (categories.find((c) => c.type === "expense")?.id || "")
  );
  const [note, setNote] = useState<string>(
    item ? `Beli impian: ${item.name} 🎒` : ""
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!item) return null;

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await purchaseWishlistItem(item.id, categoryId, note);
      if (!res.success) {
        setErrorMsg(res.error || "Gagal menebus barang impian.");
        return;
      }

      onClose();
      onSuccess(res.awardedXp, res.unlockedBadge);
    } catch {
      setErrorMsg("Terjadi gangguan saat memproses transaksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-retro">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-pixel text-sm text-white">
                Tebus Barang Impian
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Waktunya menikmati hasil jerih payahmu!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Item Target Card */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-pixel block">
            Barang yang Ditebus
          </span>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
            <span className="font-pixel text-emerald-400 font-bold text-sm">
              {formatIDR(item.target_amount)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Kategori Pengeluaran
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Catatan Transaksi
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Catatan pengeluaran..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Pengeluaran sebesar{" "}
              <strong className="text-white">{formatIDR(item.target_amount)}</strong>{" "}
              akan otomatis dibukukan ke riwayat keuanganmu.
            </p>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-800">
              {errorMsg}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-pixel text-slate-300 transition-all"
            >
              Nanti Dulu
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{loading ? "Memproses..." : "Tebus (+50 XP)"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
