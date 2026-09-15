import { get, set, del } from "idb-keyval";
import { TransactionType } from "@/types";

const OFFLINE_QUEUE_KEY = "story_finance_offline_tx_queue";

export interface OfflineTransactionDraft {
  localId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName?: string;
  date: string;
  note: string | null;
  createdAt: string;
}

/**
 * Fetch all pending transactions waiting to be synced.
 */
export async function getOfflineQueue(): Promise<OfflineTransactionDraft[]> {
  try {
    const queue = await get<OfflineTransactionDraft[]>(OFFLINE_QUEUE_KEY);
    return Array.isArray(queue) ? queue : [];
  } catch (err) {
    console.error("Error reading offline queue from IndexedDB:", err);
    return [];
  }
}

/**
 * Save a new transaction draft to IndexedDB when offline.
 */
export async function enqueueOfflineTransaction(
  payload: Omit<OfflineTransactionDraft, "localId" | "createdAt">
): Promise<OfflineTransactionDraft> {
  const localId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const draft: OfflineTransactionDraft = {
    ...payload,
    localId,
    createdAt: new Date().toISOString(),
  };

  try {
    const currentQueue = await getOfflineQueue();
    const updatedQueue = [...currentQueue, draft];
    await set(OFFLINE_QUEUE_KEY, updatedQueue);
  } catch (err) {
    console.error("Error writing offline transaction to IndexedDB:", err);
  }

  return draft;
}

/**
 * Remove a single successfully synced transaction from IndexedDB.
 */
export async function dequeueOfflineTransaction(localId: string): Promise<void> {
  try {
    const currentQueue = await getOfflineQueue();
    const updatedQueue = currentQueue.filter((item) => item.localId !== localId);
    await set(OFFLINE_QUEUE_KEY, updatedQueue);
  } catch (err) {
    console.error("Error removing offline transaction from IndexedDB:", err);
  }
}

/**
 * Clear the entire offline queue.
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await del(OFFLINE_QUEUE_KEY);
  } catch (err) {
    console.error("Error clearing offline queue in IndexedDB:", err);
  }
}

/**
 * Get count of pending offline transactions.
 */
export async function getPendingDraftCount(): Promise<number> {
  const queue = await getOfflineQueue();
  return queue.length;
}
