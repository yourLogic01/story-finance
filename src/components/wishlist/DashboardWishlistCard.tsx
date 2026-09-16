"use client";

import Link from "next/link";
import { WishlistItem } from "@/types";
import { formatIDR } from "@/lib/utils/currency";
import { RetroItemIcon } from "@/components/retro/RetroItemIcon";
import { ChevronRight, Sparkles, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardWishlistCardProps {
  items: WishlistItem[];
  totalSaved: number;
  activeCount: number;
}

export function DashboardWishlistCard({
  items,
  totalSaved,
  activeCount,
}: DashboardWishlistCardProps) {
  // Find top priority active item (highest % or closest to ready)
  const activeItems = items.filter((i) => i.status !== "purchased");
  const topItem = activeItems[0] || null;

  const topPercent = topItem
    ? Math.min(100, Math.round((topItem.saved_amount / topItem.target_amount) * 100))
    : 0;

  return (
    <Link
      href="/wishlist"
      prefetch={true}
      className="block p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-white shadow-retro-sm transition-all active:scale-[0.99] group relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Coins className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-pixel text-[11px] text-amber-400 uppercase tracking-wider block">
              WISHLIST
            </span>
            <span className="text-[10px] text-slate-400 font-sans block -mt-0.5">
              {activeCount > 0
                ? `${formatIDR(totalSaved)} terkumpul • ${activeCount} barang`
                : "Belum ada barang di wishlist"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-pixel group-hover:translate-x-0.5 transition-transform">
          <span>Buka</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Featured Item Progress or Empty State */}
      {topItem ? (
        <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <RetroItemIcon icon={topItem.icon} size={15} className="text-slate-300 shrink-0" />
              <span className="font-bold text-slate-200 truncate text-[11px]">
                {topItem.name}
              </span>
            </div>
            <span className="font-pixel text-[10px] text-emerald-400 font-bold shrink-0">
              {topPercent}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                topPercent >= 100
                  ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                  : "bg-emerald-500"
              )}
              style={{ width: `${topPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-500 font-pixel">
            <span>{formatIDR(topItem.saved_amount)}</span>
            <span>Target: {formatIDR(topItem.target_amount)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[11px]">Catat barang incaranmu di sini.</span>
        </div>
      )}
    </Link>
  );
}
