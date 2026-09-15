"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getOfflineQueue,
  dequeueOfflineTransaction,
  getPendingDraftCount,
} from "@/lib/offline/queue";
import { createTransaction } from "@/app/actions/transactions";

export function useOfflineSync() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Update pending drafts count
  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingDraftCount();
    setPendingCount(count);
  }, []);

  // Sync all pending drafts to server
  const syncPendingTransactions = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.onLine || isSyncing) {
      return;
    }

    const queue = await getOfflineQueue();
    if (queue.length === 0) {
      setPendingCount(0);
      return;
    }

    setIsSyncing(true);
    let successfullySynced = 0;

    for (const draft of queue) {
      try {
        const result = await createTransaction({
          amount: draft.amount,
          type: draft.type,
          categoryId: draft.categoryId,
          date: draft.date,
          note: draft.note || undefined,
        });

        if (result.success) {
          await dequeueOfflineTransaction(draft.localId);
          successfullySynced += 1;
        }
      } catch (err) {
        console.error("Failed to sync offline transaction:", err);
        // Stop batch if network fails again
        break;
      }
    }

    const remaining = await getPendingDraftCount();
    setPendingCount(remaining);
    setIsSyncing(false);

    if (successfullySynced > 0) {
      setSyncSuccessMessage(`${successfullySynced} transaksi offline berhasil disinkronkan`);
      router.refresh();

      // Auto-clear success message after 3.5 seconds
      setTimeout(() => {
        setSyncSuccessMessage(null);
      }, 3500);
    }
  }, [isSyncing, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial state
    setIsOnline(navigator.onLine);
    refreshPendingCount();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingTransactions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshPendingCount();
    };

    const handleDraftQueued = () => {
      refreshPendingCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("story_finance_offline_queued", handleDraftQueued);

    // If online and drafts exist on load, sync them
    if (navigator.onLine) {
      syncPendingTransactions();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("story_finance_offline_queued", handleDraftQueued);
    };
  }, [refreshPendingCount, syncPendingTransactions]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncSuccessMessage,
    syncPendingTransactions,
  };
}
