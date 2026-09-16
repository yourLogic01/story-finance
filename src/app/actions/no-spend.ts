"use server";

import { createClient } from "@/lib/supabase/server";
import { getTodayDateString, getMonthDateRange } from "@/lib/utils/date";
import { calculateStreak } from "@/lib/gamification/streak";
import { calculateDailyLogXp, getLevelInfo } from "@/lib/gamification/xp";
import { evaluateEligibleBadges, KNOWN_BADGES } from "@/lib/gamification/badges";
import { revalidatePath } from "next/cache";
import { NoSpendDay } from "@/types";

export interface LogNoSpendResult {
  success: boolean;
  error?: string;
  alreadyLogged?: boolean;
  gamification?: {
    awardedXp: number;
    newStreak: number;
    unlockedBadge?: { id: string; title: string; icon: string } | null;
  };
}

/**
 * Log a date as a No-Spend Day (Hari Bebas Belanja).
 * Protects and advances the user's streak, awards XP, and checks No-Spend milestones.
 */
export async function logNoSpendDay(
  targetDate?: string,
  note?: string
): Promise<LogNoSpendResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Silakan login terlebih dahulu." };
  }

  const date = targetDate || getTodayDateString();

  // 1. Check if already marked as No-Spend Day
  try {
    const { data: existing } = await supabase
      .from("no_spend_days")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        alreadyLogged: true,
        error: "Hari ini sudah ditandai sebagai Hari Bebas Belanja.",
      };
    }
  } catch (e) {
    // If table doesn't exist yet, non-fatal
    console.warn("no_spend_days query warning:", e);
  }

  // 2. Insert into no_spend_days table
  try {
    await supabase.from("no_spend_days").insert({
      user_id: user.id,
      date,
      note: note?.trim() || "Hari Bebas Belanja (Rp 0)",
    });
  } catch (err) {
    console.warn("Could not insert into no_spend_days table:", err);
  }

  // 3. Evaluate Gamification (Streak, XP, Badges)
  let awardedXp = 0;
  let unlockedBadge: { id: string; title: string; icon: string } | null = null;
  let newStreak = 1;

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
      // 3a. Calculate Streak Progression
      const streakResult = calculateStreak(
        profile.last_logged_date,
        date,
        profile.current_streak,
        profile.longest_streak
      );

      newStreak = streakResult.newStreak;

      // Base daily logging XP reward (with x2 multiplier after 7 days streak!)
      if (streakResult.isNewDayLog) {
        const xpReward = calculateDailyLogXp(streakResult.newStreak);
        awardedXp += xpReward.xp;
      }

      let currentTotalXp = profile.total_xp + awardedXp;

      // 3b. Count total transactions & no spend days
      const { count: txCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      let noSpendCount = 1;
      try {
        const { count: nsCount } = await supabase
          .from("no_spend_days")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (nsCount) noSpendCount = nsCount;
      } catch {
        // Fallback
      }

      // 3c. Evaluate eligible badges
      const eligibleBadgeIds = evaluateEligibleBadges({
        totalTransactions: txCount || 0,
        currentStreak: streakResult.newStreak,
        noSpendDaysCount: noSpendCount,
      });

      for (const badgeId of eligibleBadgeIds) {
        const { data: existingBadge } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user.id)
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

      // 3d. Update level info and gamification profile
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
    console.error("Gamification evaluation error in logNoSpendDay:", err);
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/profile");

  return {
    success: true,
    gamification: {
      awardedXp,
      newStreak,
      unlockedBadge,
    },
  };
}

/**
 * Check if today is marked as a No-Spend Day for current user.
 */
export async function isTodayNoSpend(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const todayStr = getTodayDateString();

  try {
    const { data } = await supabase
      .from("no_spend_days")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .maybeSingle();

    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Fetch all No-Spend Days within a specific month.
 */
export async function getMonthlyNoSpendDays(
  year: number,
  month: number
): Promise<NoSpendDay[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { startDate, endDate } = getMonthDateRange(year, month);

  try {
    const { data, error } = await supabase
      .from("no_spend_days")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error || !data) return [];
    return data as NoSpendDay[];
  } catch {
    return [];
  }
}

/**
 * Cancel or remove a No-Spend Day mark for a specific date.
 */
export async function cancelNoSpendDay(
  targetDate: string
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
      .from("no_spend_days")
      .delete()
      .eq("user_id", user.id)
      .eq("date", targetDate);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/history");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membatalkan.";
    return { success: false, error: msg };
  }
}
