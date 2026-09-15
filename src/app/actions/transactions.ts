"use server";

import { createClient } from "@/lib/supabase/server";
import { createTransactionSchema } from "@/lib/validations/transaction";
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
    const { data: profile } = await supabase
      .from("gamification_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const todayStr = new Date().toISOString().split("T")[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = profile.current_streak;
      let isNewDayLog = false;

      if (!profile.last_logged_date) {
        newStreak = 1;
        isNewDayLog = true;
      } else if (profile.last_logged_date === yesterdayStr) {
        newStreak = profile.current_streak + 1;
        isNewDayLog = true;
      } else if (profile.last_logged_date === todayStr) {
        // Same day logging, preserve streak
        isNewDayLog = false;
      } else {
        // Streak broken
        newStreak = 1;
        isNewDayLog = true;
      }

      // Base daily logging XP reward (+10 XP per day)
      if (isNewDayLog) {
        awardedXp += 10;
      }

      const newLongest = Math.max(profile.longest_streak, newStreak);
      let currentTotalXp = profile.total_xp + awardedXp;

      // Check badges: first_log, streak_3, streak_7, streak_30
      const potentialBadges: { id: string; condition: boolean }[] = [
        { id: "first_log", condition: true },
        { id: "streak_3", condition: newStreak >= 3 },
        { id: "streak_7", condition: newStreak >= 7 },
        { id: "streak_30", condition: newStreak >= 30 },
      ];

      for (const pb of potentialBadges) {
        if (pb.condition) {
          const { data: existingBadge } = await supabase
            .from("user_badges")
            .select("id")
            .eq("user_id", user.id)
            .eq("badge_id", pb.id)
            .maybeSingle();

          if (!existingBadge) {
            // Unlock badge!
            const { data: badgeInfo } = await supabase
              .from("badges")
              .select("*")
              .eq("id", pb.id)
              .single();

            if (badgeInfo) {
              await supabase.from("user_badges").insert({
                user_id: user.id,
                badge_id: pb.id,
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

      // Calculate level tiers (1: 0, 2: 100, 3: 300, 4: 600, 5: 1000+)
      let newLevel = 1;
      if (currentTotalXp >= 1000) newLevel = 5;
      else if (currentTotalXp >= 600) newLevel = 4;
      else if (currentTotalXp >= 300) newLevel = 3;
      else if (currentTotalXp >= 100) newLevel = 2;

      await supabase
        .from("gamification_profiles")
        .update({
          current_streak: newStreak,
          longest_streak: newLongest,
          total_xp: currentTotalXp,
          current_level: newLevel,
          last_logged_date: todayStr,
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

  return {
    success: true,
    data: transaction,
    gamification: {
      awardedXp,
      unlockedBadge,
    },
  };
}
