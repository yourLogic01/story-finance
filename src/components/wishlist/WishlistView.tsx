"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Category, WishlistItem } from "@/types";
import { WishlistSummaryData, deleteWishlistItem } from "@/app/actions/wishlist";
import { WishlistCard } from "./WishlistCard";
import { AddWishlistModal } from "./AddWishlistModal";
import { DepositModal } from "./DepositModal";
import { RedeemModal } from "./RedeemModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { formatIDR } from "@/lib/utils/currency";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Trophy,
  Coins,
  PackageOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WishlistViewProps {
  initialData: WishlistSummaryData;
  categories: Category[];
}

export function WishlistView({
  initialData,
  categories,
}: WishlistViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [depositItem, setDepositItem] = useState<WishlistItem | null>(null);
  const [redeemItem, setRedeemItem] = useState<WishlistItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WishlistItem | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Celebration popover state
  const [celebration, setCelebration] = useState<{
    xp: number;
    badge?: { title: string; icon: string } | null;
  } | null>(null);

  const activeItems = initialData.items.filter((i) => i.status !== "purchased");
  const completedItems = initialData.items.filter((i) => i.status === "purchased");

  const handleActionSuccess = (
    awardedXp?: number,
    badge?: { title: string; icon: string } | null
  ) => {
    router.refresh();
    if (awardedXp) {
      setCelebration({ xp: awardedXp, badge });
      setTimeout(() => setCelebration(null), 4000);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWishlistItem(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen px-4 pt-4 pb-12 space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-pixel text-slate-400 hover:text-white transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Beranda</span>
        </Link>

        <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800 text-[10px] font-pixel text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>INVENTORY RPG</span>
        </div>
      </div>

      {/* Main Title & Quick Action */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-pixel text-amber-400 uppercase tracking-wider block">
            Tas Impian
          </span>
          <h1 className="text-xl font-bold font-pixel text-white">
            Wishlist Bag
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Celebration Notification Toast */}
      {celebration && (
        <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-500/80 text-emerald-200 text-xs flex items-center justify-between shadow-retro animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-pixel text-[11px] font-bold text-white">
                +{celebration.xp} XP Didapat!
              </p>
              {celebration.badge && (
                <p className="text-[10px] text-emerald-400">
                  Lencana Baru: {celebration.badge.title} 🏆
                </p>
              )}
            </div>
          </div>
          <span className="text-[10px] font-pixel text-emerald-400">LEVEL UP!</span>
        </div>
      )}

      {/* Savings Piggy Widget */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Total Celengan Aktif</span>
          </div>
          <span className="font-pixel text-slate-500">
            {initialData.activeCount} Barang
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-xl font-bold font-pixel text-emerald-400">
            {formatIDR(initialData.totalSaved)}
          </span>
          <span className="text-xs text-slate-400">
            dari {formatIDR(initialData.totalTarget)}
          </span>
        </div>

        {/* Global Progress */}
        {initialData.totalTarget > 0 && (
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (initialData.totalSaved / initialData.totalTarget) * 100
                    )
                  )}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-slate-400 text-right font-pixel">
              {Math.min(
                100,
                Math.round(
                  (initialData.totalSaved / initialData.totalTarget) * 100
                )
              )}
              % tercapai
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={cn(
            "py-2 rounded-lg text-xs font-pixel transition-all flex items-center justify-center gap-1.5",
            activeTab === "active"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <span>Sedang Ditabung</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
            {activeItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={cn(
            "py-2 rounded-lg text-xs font-pixel transition-all flex items-center justify-center gap-1.5",
            activeTab === "completed"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          <Trophy className="w-3 h-3 text-amber-400" />
          <span>Lemari Koleksi</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-300">
            {completedItems.length}
          </span>
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3 pt-1">
        {activeTab === "active" ? (
          activeItems.length > 0 ? (
            activeItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onDeposit={(itm) => setDepositItem(itm)}
                onRedeem={(itm) => setRedeemItem(itm)}
                onDelete={(itm) => setDeleteTarget(itm)}
              />
            ))
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center">
                <PackageOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-pixel">
                  Tas Impian Masih Kosong
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Mulai catat barang yang mau kamu beli biar bisa ditabung pelan-pelan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(true)}
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-pixel font-bold inline-flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Barang Pertama</span>
              </button>
            </div>
          )
        ) : completedItems.length > 0 ? (
          completedItems.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onDeposit={() => {}}
              onRedeem={() => {}}
              onDelete={(itm) => setDeleteTarget(itm)}
            />
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white font-pixel">
              Belum Ada Barang yang Ditebus
            </h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Semangat menabung! Barang yang berhasil ditebus nanti akan dipajang di lemari ini.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddWishlistModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        categories={categories}
        onSuccess={() => handleActionSuccess()}
      />

      <DepositModal
        isOpen={!!depositItem}
        onClose={() => setDepositItem(null)}
        item={depositItem}
        onSuccess={(xp, badge) => handleActionSuccess(xp, badge)}
      />

      <RedeemModal
        isOpen={!!redeemItem}
        onClose={() => setRedeemItem(null)}
        item={redeemItem}
        categories={categories}
        onSuccess={(xp, badge) => handleActionSuccess(xp, badge)}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Barang Impian?"
        description={`Kamu yakin ingin menghapus "${deleteTarget?.name}" dari tas impian?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onSuccess={() => router.refresh()}
      />

      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
