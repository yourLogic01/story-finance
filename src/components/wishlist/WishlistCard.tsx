"use client";

import { WishlistItem } from "@/types";
import { formatIDR } from "@/lib/utils/currency";
import { RetroItemIcon } from "@/components/retro/RetroItemIcon";
import { Coins, Gift, Trash2, CheckCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistCardProps {
  item: WishlistItem;
  onDeposit: (item: WishlistItem) => void;
  onRedeem: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
}

export function WishlistCard({
  item,
  onDeposit,
  onRedeem,
  onDelete,
}: WishlistCardProps) {
  const percent = Math.min(
    100,
    Math.round((item.saved_amount / item.target_amount) * 100)
  );
  const isReady = percent >= 100 && item.status !== "purchased";
  const isPurchased = item.status === "purchased";

  return (
    <div
      className={cn(
        "p-3.5 rounded-2xl border transition-all relative overflow-hidden",
        isPurchased
          ? "bg-slate-900/60 border-slate-800 opacity-80"
          : isReady
          ? "bg-slate-900 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40"
          : "bg-slate-900 border-slate-800 hover:border-slate-700"
      )}
    >
      {/* Top Row: Icon + Name + Actions */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
              isPurchased
                ? "bg-emerald-950/80 border-emerald-800 text-emerald-400"
                : isReady
                ? "bg-amber-950/80 border-amber-500 text-amber-400 animate-pulse"
                : "bg-slate-800 border-slate-700 text-slate-200"
            )}
          >
            <RetroItemIcon icon={item.icon} size={20} />
          </div>

          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white truncate font-sans">
              {item.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isPurchased ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-emerald-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Sudah Didapat</span>
                </span>
              ) : isReady ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-pixel text-amber-400 font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Siap Ditebus!</span>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-sans">
                  Target: {formatIDR(item.target_amount)}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          title="Hapus barang"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress Section (if not purchased) */}
      {!isPurchased && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-pixel text-slate-400">
              {formatIDR(item.saved_amount)}
            </span>
            <span
              className={cn(
                "text-[10px] font-pixel font-bold",
                isReady ? "text-amber-400" : "text-emerald-400"
              )}
            >
              {percent}%
            </span>
          </div>

          {/* Retro Progress Bar */}
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isReady
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                  : "bg-emerald-500"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isPurchased ? (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDeposit(item)}
            className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-pixel text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>+ Sisihkan</span>
          </button>

          <button
            type="button"
            onClick={() => onRedeem(item)}
            className={cn(
              "flex-1 py-1.5 px-2.5 rounded-lg text-xs font-pixel font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs",
              isReady
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 animate-bounce"
                : "bg-slate-800/90 hover:bg-slate-700 text-emerald-400 border border-emerald-800/60"
            )}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Tebus</span>
          </button>
        </div>
      ) : (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Nilai Barang:</span>
          <span className="font-pixel text-slate-300">
            {formatIDR(item.target_amount)}
          </span>
        </div>
      )}
    </div>
  );
}
