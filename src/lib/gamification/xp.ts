/**
 * Gamification XP Engine, Level Tier Definitions & Progress Calculators
 */

export const DAILY_LOG_BASE_XP = 10;

export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number | null; // null for highest level
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: "Pemula Hemat", minXp: 0, maxXp: 100 },
  { level: 2, title: "Pencatat Bijak", minXp: 100, maxXp: 300 },
  { level: 3, title: "Penjaga Anggaran", minXp: 300, maxXp: 600 },
  { level: 4, title: "Strategis Finansial", minXp: 600, maxXp: 1000 },
  { level: 5, title: "Master Keuangan", minXp: 1000, maxXp: null },
];

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  currentTierBaseXp: number;
  nextTierXp: number;
  xpInCurrentTier: number;
  xpNeededForNextTier: number;
  progressPercent: number;
  isMaxLevel: boolean;
}

/**
 * Calculate user level, rank title, and relative progress percentage towards the next level tier.
 */
export function getLevelInfo(totalXp: number): LevelInfo {
  const safeXp = Math.max(0, totalXp);

  // Find corresponding tier
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    const tier = LEVEL_TIERS[i];
    if (safeXp >= tier.minXp) {
      if (tier.maxXp === null) {
        // Max Level reached (Level 5)
        return {
          level: tier.level,
          title: tier.title,
          totalXp: safeXp,
          currentTierBaseXp: tier.minXp,
          nextTierXp: tier.minXp,
          xpInCurrentTier: safeXp - tier.minXp,
          xpNeededForNextTier: 0,
          progressPercent: 100,
          isMaxLevel: true,
        };
      }

      const tierSpan = tier.maxXp - tier.minXp;
      const progressInTier = safeXp - tier.minXp;
      const progressPercent = Math.min(
        100,
        Math.max(0, Math.round((progressInTier / tierSpan) * 100))
      );

      return {
        level: tier.level,
        title: tier.title,
        totalXp: safeXp,
        currentTierBaseXp: tier.minXp,
        nextTierXp: tier.maxXp,
        xpInCurrentTier: progressInTier,
        xpNeededForNextTier: tierSpan,
        progressPercent,
        isMaxLevel: false,
      };
    }
  }

  // Fallback Level 1
  return {
    level: 1,
    title: LEVEL_TIERS[0].title,
    totalXp: safeXp,
    currentTierBaseXp: 0,
    nextTierXp: 100,
    xpInCurrentTier: safeXp,
    xpNeededForNextTier: 100,
    progressPercent: Math.min(100, safeXp),
    isMaxLevel: false,
  };
}
