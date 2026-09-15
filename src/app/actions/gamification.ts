"use server";

import { createClient } from "@/lib/supabase/server";
import { getLevelInfo } from "@/lib/gamification/xp";
import { KNOWN_BADGES } from "@/lib/gamification/badges";

export interface BadgeWithStatus {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

export interface GamificationProfileResponse {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  currentTierBaseXp: number;
  nextTierXp: number;
  xpInCurrentTier: number;
  xpNeededForNextTier: number;
  xpProgressPercent: number;
  isMaxLevel: boolean;
  lastLoggedDate: string | null;
  badges: BadgeWithStatus[];
}

export async function getGamificationProfile(): Promise<GamificationProfileResponse | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // 1. Fetch user's gamification profile
  let { data: profile } = await supabase
    .from("gamification_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // If not found, initialize one
  if (!profile) {
    const { data: inserted } = await supabase
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

    profile = inserted;
  }

  const totalXp = profile?.total_xp ?? 0;
  const levelInfo = getLevelInfo(totalXp);

  // Sync level if different
  if (profile && profile.current_level !== levelInfo.level) {
    await supabase
      .from("gamification_profiles")
      .update({ current_level: levelInfo.level })
      .eq("user_id", user.id);
  }

  // 2. Fetch all badges from database and sync missing badges
  const { data: dbBadges } = await supabase
    .from("badges")
    .select("*");

  const existingDbBadgeIds = new Set((dbBadges || []).map((b) => b.id));
  const missingBadges = KNOWN_BADGES.filter((kb) => !existingDbBadgeIds.has(kb.id));

  if (missingBadges.length > 0) {
    try {
      await supabase.from("badges").upsert(missingBadges, { onConflict: "id" });
    } catch (e) {
      console.warn("Could not upsert missing badges:", e);
    }
  }

  const badgeCatalog = KNOWN_BADGES.map((kb) => {
    const fromDb = (dbBadges || []).find((b) => b.id === kb.id);
    return fromDb || kb;
  });

  // 3. Fetch user's unlocked badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_id, unlocked_at")
    .eq("user_id", user.id);

  const unlockedMap = new Map<string, string>();
  for (const ub of userBadges || []) {
    unlockedMap.set(ub.badge_id, ub.unlocked_at);
  }

  const badgesWithStatus: BadgeWithStatus[] = badgeCatalog.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    icon: b.icon,
    xp_reward: b.xp_reward,
    unlocked: unlockedMap.has(b.id),
    unlocked_at: unlockedMap.get(b.id) || null,
  }));

  return {
    currentStreak: profile?.current_streak ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
    totalXp,
    currentLevel: levelInfo.level,
    levelTitle: levelInfo.title,
    currentTierBaseXp: levelInfo.currentTierBaseXp,
    nextTierXp: levelInfo.nextTierXp,
    xpInCurrentTier: levelInfo.xpInCurrentTier,
    xpNeededForNextTier: levelInfo.xpNeededForNextTier,
    xpProgressPercent: levelInfo.progressPercent,
    isMaxLevel: levelInfo.isMaxLevel,
    lastLoggedDate: profile?.last_logged_date ?? null,
    badges: badgesWithStatus,
  };
}
