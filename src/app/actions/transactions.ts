"use server";

import { createClient } from "@/lib/supabase/server";
import { createTransactionSchema } from "@/lib/validations/transaction";
import { calculateStreak } from "@/lib/gamification/streak";
import { DAILY_LOG_BASE_XP, getLevelInfo } from "@/lib/gamification/xp";
import { evaluateEligibleBadges } from "@/lib/gamification/badges";
import { revalidatePath } from "next/cache";

export async function createTransaction(formData: unknown) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  const parseResult = createTransactionSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "Data transaksi tidak valid",
    };
  }

  const { amount, type, categoryId, date, note } = parseResult.data;

  // 1. Insert transaction
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      category_id: categoryId,
      type,
      amount,
      date,
      note: note || null,
    })
    .select("*, category:categories(*)")
    .single();

  if (txError || !transaction) {
    return {
      success: false,
      error: txError?.message || "Gagal menyimpan transaksi.",
    };
  }

  // 2. Evaluate Gamification (Streaks, XP, Badges)
  let awardedXp = 0;
  let unlockedBadge: { id: string; title: string; icon: string } | null = null;

  try {
    let { data: profile } = await supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      const { data: created } = await supabase
        .from("gamification_profiles")
        .insert({
          user_id: user.id,
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
      // 2a. Calculate Streak Progression
      const streakResult = calculateStreak(
        profile.last_logged_date,
        date,
        profile.current_streak,
        profile.longest_streak
      );

      // Base daily logging XP reward (+10 XP per day)
      if (streakResult.isNewDayLog) {
        awardedXp += DAILY_LOG_BASE_XP;
      }

      let currentTotalXp = profile.total_xp + awardedXp;

      // 2b. Count total transactions to evaluate badges
      const { count: txCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // 2c. Evaluate eligible badges
      const eligibleBadgeIds = evaluateEligibleBadges({
        totalTransactions: txCount || 1,
        currentStreak: streakResult.newStreak,
      });

      for (const badgeId of eligibleBadgeIds) {
        const { data: existingBadge } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user.id)
          .eq("badge_id", badgeId)
          .maybeSingle();

        if (!existingBadge) {
          const { data: badgeInfo } = await supabase
            .from("badges")
            .select("*")
            .eq("id", badgeId)
            .maybeSingle();

          if (badgeInfo) {
            await supabase.from("user_badges").insert({
              user_id: user.id,
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

      // 2d. Calculate level tier
      const levelInfo = getLevelInfo(currentTotalXp);

      await supabase
        .from("gamification_profiles")
        .update({
          current_streak: streakResult.newStreak,
          longest_streak: streakResult.newLongestStreak,
          total_xp: currentTotalXp,
          current_level: levelInfo.level,
          last_logged_date: streakResult.isNewDayLog ? date : profile.last_logged_date,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }
  } catch (err) {
    // Non-blocking: gamification failure should not abort the saved financial record
    console.error("Gamification calculation error:", err);
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/profile");

  return {
    success: true,
    data: transaction,
    gamification: {
      awardedXp,
      unlockedBadge,
    },
  };
}

export async function updateTransaction(id: string, formData: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  const parseResult = createTransactionSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "Data transaksi tidak valid",
    };
  }

  const { amount, type, categoryId, date, note } = parseResult.data;

  const { data: updated, error } = await supabase
    .from("transactions")
    .update({
      category_id: categoryId,
      type,
      amount,
      date,
      note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*, category:categories(*)")
    .single();

  if (error || !updated) {
    return {
      success: false,
      error: error?.message || "Gagal memperbarui transaksi.",
    };
  }

  revalidatePath("/");
  revalidatePath("/history");

  return {
    success: true,
    data: updated,
  };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message || "Gagal menghapus transaksi.",
    };
  }

  revalidatePath("/");
  revalidatePath("/history");

  return {
    success: true,
  };
}

