"use client";

import { useOfflineSync } from "@/hooks/use-offline-sync";
import { WifiOff, Loader2, CheckCircle2, CloudUpload } from "lucide-react";

export function OfflineBanner() {
  const {
    isOnline,
    isSyncing,
    pendingCount,
    syncSuccessMessage,
    syncPendingTransactions,
  } = useOfflineSync();

  // Nothing to display if online, idle, and no pending drafts
  if (isOnline && !isSyncing && pendingCount === 0 && !syncSuccessMessage) {
    return null;
  }

  return (
    <aside
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm transition-all duration-300 pointer-events-auto"
    >
      {/* 1. Sync Success Notification */}
      {syncSuccessMessage && (
        <div className="flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-lg animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
          <span className="flex-1 truncate">{syncSuccessMessage}</span>
        </div>
      )}

      {/* 2. Currently Syncing Banner */}
      {!syncSuccessMessage && isSyncing && (
        <div className="flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg animate-in slide-in-from-top-2 duration-200">
          <Loader2 className="w-4 h-4 shrink-0 animate-spin text-emerald-400" />
          <span className="flex-1">
            Menyinkronkan {pendingCount} transaksi...
          </span>
        </div>
      )}

      {/* 3. Offline Mode Banner */}
      {!syncSuccessMessage && !isSyncing && !isOnline && (
        <div className="flex items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-amber-400 text-xs font-semibold border border-amber-500/30 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
            <div className="truncate">
              <span>Mode Offline</span>
              {pendingCount > 0 && (
                <span className="text-slate-300 font-normal ml-1">
                  • {pendingCount} transaksi tersimpan lokal
                </span>
              )}
            </div>
          </div>

          <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-wider shrink-0">
            OFFLINE
          </span>
        </div>
      )}

      {/* 4. Online with pending drafts waiting for sync */}
      {!syncSuccessMessage && !isSyncing && isOnline && pendingCount > 0 && (
        <div className="flex items-center justify-between gap-2 p-2.5 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <CloudUpload className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="truncate">
              {pendingCount} transaksi menunggu sinkronisasi
            </span>
          </div>

          <button
            type="button"
            onClick={syncPendingTransactions}
            className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-slate-800 px-2.5 py-1 rounded-lg transition-colors shrink-0"
          >
            Sinkronkan
          </button>
        </div>
      )}
    </aside>
  );
}
