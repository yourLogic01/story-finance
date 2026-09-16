"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Category } from "@/types";
import { parseIDRInput } from "@/lib/utils/currency";
import { createWishlistItem } from "@/app/actions/wishlist";
import {
  RetroItemIcon,
  WISHLIST_ICON_LIST,
  WishlistIconKey,
} from "@/components/retro/RetroItemIcon";
import { Sparkles, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

export function AddWishlistModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: AddWishlistModalProps) {
  const [name, setName] = useState<string>("");
  const [targetAmountStr, setTargetAmountStr] = useState<string>("");
  const [selectedIcon, setSelectedIcon] = useState<WishlistIconKey>("gift");
  const [categoryId, setCategoryId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseIDRInput(targetAmountStr);

    if (!name.trim()) {
      setErrorMsg("Nama barang impian wajib diisi.");
      return;
    }
    if (targetAmount <= 0) {
      setErrorMsg("Target dana harus lebih dari Rp 0.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await createWishlistItem({
        name: name.trim(),
        target_amount: targetAmount,
        icon: selectedIcon,
        category_id: categoryId || null,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Gagal membuat barang impian.");
        return;
      }

      // Reset form
      setName("");
      setTargetAmountStr("");
      setSelectedIcon("gift");
      setCategoryId("");
      onClose();
      onSuccess();
    } catch {
      setErrorMsg("Terjadi gangguan saat menyimpan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-5 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-retro max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="font-pixel text-sm text-white">
                Tambah Barang Impian
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Catat barang yang mau kamu capai pelan-pelan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Nama Barang
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="Contoh: Sepatu Lari, TWS Baru..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Target Harga
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-pixel text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={targetAmountStr}
                onChange={(e) => {
                  const numeric = e.target.value.replace(/\D/g, "");
                  setTargetAmountStr(
                    numeric ? Number(numeric).toLocaleString("id-ID") : ""
                  );
                  setErrorMsg(null);
                }}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-10 pr-3 text-xs font-pixel text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Pilih Icon Barang
            </label>
            <div className="grid grid-cols-4 gap-2">
              {WISHLIST_ICON_LIST.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedIcon(item.key)}
                  className={cn(
                    "p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all text-center",
                    selectedIcon === item.key
                      ? "bg-emerald-950 border-emerald-400 text-emerald-400 scale-105"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  )}
                >
                  <RetroItemIcon icon={item.key} size={18} />
                  <span className="text-[9px] truncate w-full">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Category */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 block">
              Pos Kategori (Opsional)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="" className="bg-slate-900">
                Pilih otomatis saat ditebus
              </option>
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-900">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded-lg border border-rose-800">
              {errorMsg}
            </p>
          )}

          {/* Actions */}
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
              <span>{loading ? "Menyimpan..." : "Simpan Barang"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
