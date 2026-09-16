"use server";

import { createClient } from "@/lib/supabase/server";
import { WishlistItem, WishlistStatus } from "@/types";
import { getLevelInfo } from "@/lib/gamification/xp";
import { evaluateEligibleBadges, KNOWN_BADGES } from "@/lib/gamification/badges";
import { getTodayDateString } from "@/lib/utils/date";
import { revalidatePath } from "next/cache";

export interface WishlistSummaryData {
  items: WishlistItem[];
  totalSaved: number;
  totalTarget: number;
  activeCount: number;
  completedCount: number;
}

export interface WishlistActionResult {
  success: boolean;
  error?: string;
  item?: WishlistItem;
  awardedXp?: number;
  unlockedBadge?: { id: string; title: string; icon: string } | null;
}

/**
 * Fetch all wishlist items for current user with joined category.
 */
export async function getWishlistData(): Promise<WishlistSummaryData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data: rawItems, error } = await supabase
      .from("wishlist_items")
      .select("*, category:categories(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Could not fetch wishlist_items:", error.message);
      return {
        items: [],
        totalSaved: 0,
        totalTarget: 0,
        activeCount: 0,
        completedCount: 0,
      };
    }

    const items = (rawItems || []).map((item) => ({
      ...item,
      target_amount: Number(item.target_amount) || 0,
      saved_amount: Number(item.saved_amount) || 0,
    })) as WishlistItem[];

    let totalSaved = 0;
    let totalTarget = 0;
    let activeCount = 0;
    let completedCount = 0;

    for (const item of items) {
      if (item.status === "purchased") {
        completedCount += 1;
      } else {
        activeCount += 1;
        totalSaved += item.saved_amount;
        totalTarget += item.target_amount;
      }
    }

    return {
      items,
      totalSaved,
      totalTarget,
      activeCount,
      completedCount,
    };
  } catch (err) {
    console.error("Wishlist query failed:", err);
    return {
      items: [],
      totalSaved: 0,
      totalTarget: 0,
      activeCount: 0,
      completedCount: 0,
    };
  }
}

/**
 * Helper to grant XP and evaluate badges
 */
async function awardWishlistXp(
  userId: string,
  baseXp: number,
  isPurchasedEvent = false
) {
  const supabase = await createClient();
  let awardedXp = baseXp;
  let unlockedBadge: { id: string; title: string; icon: string } | null = null;

  try {
    let { data: profile } = await supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: created } = await supabase
        .from("gamification_profiles")
        .insert({
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          total_xp: 0,
          current_level: 1,
        })
        .select("*")
        .single();
      profile = created;
    }

    if (profile) {
      let currentTotalXp = profile.total_xp + awardedXp;

      if (isPurchasedEvent) {
        // Count purchased items
        const { count: purchasedCount } = await supabase
          .from("wishlist_items")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "purchased");

        const eligibleBadgeIds = evaluateEligibleBadges({
          totalTransactions: 0,
          currentStreak: profile.current_streak || 0,
          purchasedWishlistCount: purchasedCount || 1,
        });

        for (const badgeId of eligibleBadgeIds) {
          if (badgeId !== "wishlist_first" && badgeId !== "wishlist_collector") continue;

          const { data: existingBadge } = await supabase
            .from("user_badges")
            .select("id")
            .eq("user_id", userId)
            .eq("badge_id", badgeId)
            .maybeSingle();

          if (!existingBadge) {
            let { data: badgeInfo } = await supabase
              .from("badges")
              .select("*")
              .eq("id", badgeId)
              .maybeSingle();

            if (!badgeInfo) {
              const known = KNOWN_BADGES.find((kb) => kb.id === badgeId);
              if (known) {
                await supabase.from("badges").upsert(known, { onConflict: "id" });
                badgeInfo = known;
              }
            }

            if (badgeInfo) {
              await supabase.from("user_badges").insert({
                user_id: userId,
                badge_id: badgeId,
              });

              awardedXp += badgeInfo.xp_reward;
              currentTotalXp += badgeInfo.xp_reward;
              unlockedBadge = {
                id: badgeInfo.id,
                title: badgeInfo.title,
                icon: badgeInfo.icon,
              };
            }
          }
        }
      }

      const newLevelInfo = getLevelInfo(currentTotalXp);
      await supabase
        .from("gamification_profiles")
        .update({
          total_xp: currentTotalXp,
          current_level: newLevelInfo.level,
        })
        .eq("user_id", userId);
    }
  } catch (err) {
    console.warn("Gamification award error:", err);
  }

  return { awardedXp, unlockedBadge };
}

/**
 * Create a new wishlist item.
 */
export async function createWishlistItem(data: {
  name: string;
  target_amount: number;
  icon?: string;
  category_id?: string | null;
}): Promise<WishlistActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  const name = data.name.trim();
  if (!name) {
    return { success: false, error: "Nama barang impian tidak boleh kosong." };
  }

  const targetAmount = Number(data.target_amount);
  if (isNaN(targetAmount) || targetAmount <= 0) {
    return { success: false, error: "Target dana harus lebih dari Rp 0." };
  }

  try {
    const { data: inserted, error } = await supabase
      .from("wishlist_items")
      .insert({
        user_id: user.id,
        name,
        target_amount: targetAmount,
        saved_amount: 0,
        icon: data.icon || "gift",
        category_id: data.category_id || null,
        status: "saving",
      })
      .select("*, category:categories(*)")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/wishlist");
    revalidatePath("/");

    return {
      success: true,
      item: inserted as WishlistItem,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menyimpan barang impian.",
    };
  }
}

/**
 * Add savings to a wishlist item.
 */
export async function depositToWishlist(
  itemId: string,
  amount: number
): Promise<WishlistActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Nominal tabungan harus lebih dari Rp 0." };
  }

  try {
    const { data: item, error: fetchErr } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !item) {
      return { success: false, error: "Barang impian tidak ditemukan." };
    }

    const currentSaved = Number(item.saved_amount) || 0;
    const targetAmount = Number(item.target_amount) || 0;
    const newSaved = currentSaved + amount;
    const newStatus: WishlistStatus =
      newSaved >= targetAmount ? "ready" : "saving";

    const { data: updated, error: updateErr } = await supabase
      .from("wishlist_items")
      .update({
        saved_amount: newSaved,
        status: newStatus,
      })
      .eq("id", itemId)
      .select("*, category:categories(*)")
      .single();

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // Award +10 XP for saving action
    const { awardedXp, unlockedBadge } = await awardWishlistXp(user.id, 10);

    revalidatePath("/wishlist");
    revalidatePath("/");

    return {
      success: true,
      item: updated as WishlistItem,
      awardedXp,
      unlockedBadge,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menambah tabungan.",
    };
  }
}

/**
 * Redeem/Purchase a wishlist item.
 * Automatically inserts an expense transaction into cashflow.
 */
export async function purchaseWishlistItem(
  itemId: string,
  categoryId?: string,
  note?: string
): Promise<WishlistActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  try {
    const { data: item, error: fetchErr } = await supabase
      .from("wishlist_items")
      .select("*")
      .eq("id", itemId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !item) {
      return { success: false, error: "Barang impian tidak ditemukan." };
    }

    if (item.status === "purchased") {
      return { success: false, error: "Barang ini sudah pernah ditebus." };
    }

    // Determine category to record transaction
    let finalCategoryId = categoryId || item.category_id;
    if (!finalCategoryId) {
      // Pick first expense category
      const { data: defaultCat } = await supabase
        .from("categories")
        .select("id")
        .eq("type", "expense")
        .limit(1)
        .maybeSingle();

      finalCategoryId = defaultCat?.id || null;
    }

    if (!finalCategoryId) {
      return {
        success: false,
        error: "Pilih kategori pengeluaran terlebih dahulu.",
      };
    }

    const price = Number(item.target_amount) || Number(item.saved_amount) || 0;
    const today = getTodayDateString();

    // 1. Create real expense transaction
    const { error: txErr } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: price,
      type: "expense",
      category_id: finalCategoryId,
      date: today,
      note: note?.trim() || `Tebus Impian: ${item.name} 🎒`,
    });

    if (txErr) {
      return {
        success: false,
        error: `Gagal mencatat transaksi: ${txErr.message}`,
      };
    }

    // 2. Mark item as purchased
    const { data: updatedItem, error: updateErr } = await supabase
      .from("wishlist_items")
      .update({
        status: "purchased",
        purchased_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select("*, category:categories(*)")
      .single();

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    // 3. Award +50 XP bonus + evaluate wishlist badges
    const { awardedXp, unlockedBadge } = await awardWishlistXp(
      user.id,
      50,
      true
    );

    revalidatePath("/wishlist");
    revalidatePath("/");
    revalidatePath("/history");

    return {
      success: true,
      item: updatedItem as WishlistItem,
      awardedXp,
      unlockedBadge,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menebus barang impian.",
    };
  }
}

/**
 * Delete a wishlist item.
 */
export async function deleteWishlistItem(
  itemId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  try {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/wishlist");
    revalidatePath("/");

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal menghapus barang impian.",
    };
  }
}
