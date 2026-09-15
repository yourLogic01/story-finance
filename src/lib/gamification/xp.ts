/**
 * Gamification XP Engine, Level Tier Definitions & Progress Calculators
 */

export const DAILY_LOG_BASE_XP = 10;

/**
 * Calculate XP reward for daily logging, including streak multiplier (x2 after 7 days)
 */
export function calculateDailyLogXp(currentStreak: number): {
  xp: number;
  hasMultiplier: boolean;
  multiplier: number;
} {
  if (currentStreak >= 7) {
    return {
      xp: DAILY_LOG_BASE_XP * 2,
      hasMultiplier: true,
      multiplier: 2,
    };
  }
  return {
    xp: DAILY_LOG_BASE_XP,
    hasMultiplier: false,
    multiplier: 1,
  };
}

export interface LevelTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number | null; // null for highest level
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: "Pemula Hemat", minXp: 0, maxXp: 100 },
  { level: 2, title: "Pencatat Pemula", minXp: 100, maxXp: 250 },
  { level: 3, title: "Pencatat Bijak", minXp: 250, maxXp: 450 },
  { level: 4, title: "Penjaga Dompet", minXp: 450, maxXp: 700 },
  { level: 5, title: "Penjaga Anggaran", minXp: 700, maxXp: 1000 },
  { level: 6, title: "Pengamat Arus Kas", minXp: 1000, maxXp: 1400 },
  { level: 7, title: "Perencana Finansial", minXp: 1400, maxXp: 1900 },
  { level: 8, title: "Strategis Finansial", minXp: 1900, maxXp: 2500 },
  { level: 9, title: "Disiplin Tangguh", minXp: 2500, maxXp: 3200 },
  { level: 10, title: "Pejuang Bebas Utang", minXp: 3200, maxXp: 4000 },
  { level: 11, title: "Arsitek Keuangan", minXp: 4000, maxXp: 5000 },
  { level: 12, title: "Penjelajah Dana", minXp: 5000, maxXp: 6200 },
  { level: 13, title: "Manajer Moneter", minXp: 6200, maxXp: 7600 },
  { level: 14, title: "Pakar Alokasi", minXp: 7600, maxXp: 9200 },
  { level: 15, title: "Penjinak Inflasi", minXp: 9200, maxXp: 11000 },
  { level: 16, title: "Pengendali Cashflow", minXp: 11000, maxXp: 13000 },
  { level: 17, title: "Penabung Legendaris", minXp: 13000, maxXp: 15500 },
  { level: 18, title: "Master Keuangan", minXp: 15500, maxXp: 18500 },
  { level: 19, title: "Grandmaster Finansial", minXp: 18500, maxXp: 22000 },
  { level: 20, title: "Sultan Bijak", minXp: 22000, maxXp: null },
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
