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
  icon: string;
  tierId: "bronze" | "silver" | "gold" | "platinum" | "immortal";
}

export interface TierGroup {
  id: "bronze" | "silver" | "gold" | "platinum" | "immortal";
  name: string;
  titleRange: string;
  minLevel: number;
  maxLevel: number;
  ringClass: string;
  badgeBg: string;
  badgeText: string;
  borderSymbol: string;
  description: string;
}

export const TIER_GROUPS: TierGroup[] = [
  {
    id: "bronze",
    name: "Tier Bronze",
    titleRange: "Lv. 1 - 4",
    minLevel: 1,
    maxLevel: 4,
    ringClass: "ring-2 ring-slate-200 shadow-xs",
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
    badgeText: "text-slate-500",
    borderSymbol: "🌱",
    description: "Mulai bangun kebiasaan mencatat pengeluaran harian.",
  },
  {
    id: "silver",
    name: "Tier Silver",
    titleRange: "Lv. 5 - 8",
    minLevel: 5,
    maxLevel: 8,
    ringClass: "ring-2 ring-slate-300 shadow-[0_0_10px_rgba(203,213,225,0.6)]",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    badgeText: "text-slate-600",
    borderSymbol: "🛡️",
    description: "Mulai terbiasa dan rutin mengawasi pengeluaran.",
  },
  {
    id: "gold",
    name: "Tier Gold",
    titleRange: "Lv. 9 - 12",
    minLevel: 9,
    maxLevel: 12,
    ringClass: "ring-2 ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-300",
    badgeText: "text-amber-600",
    borderSymbol: "⭐",
    description: "Pencatatan konsisten dan pengeluaran lebih terkontrol.",
  },
  {
    id: "platinum",
    name: "Tier Platinum",
    titleRange: "Lv. 13 - 16",
    minLevel: 13,
    maxLevel: 16,
    ringClass: "ring-2 ring-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.5)]",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
    badgeText: "text-emerald-600",
    borderSymbol: "💎",
    description: "Terbiasa membagi pos anggaran bulanan dengan rapi.",
  },
  {
    id: "immortal",
    name: "Tier Immortal",
    titleRange: "Lv. 17 - 20",
    minLevel: 17,
    maxLevel: 20,
    ringClass: "ring-2 ring-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.55)]",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-300",
    badgeText: "text-purple-600",
    borderSymbol: "⚜️",
    description: "Level tertinggi, konsisten mencatat keuangan setiap hari.",
  },
];

export function getTierGroup(level: number): TierGroup {
  if (level >= 17) return TIER_GROUPS[4];
  if (level >= 13) return TIER_GROUPS[3];
  if (level >= 9) return TIER_GROUPS[2];
  if (level >= 5) return TIER_GROUPS[1];
  return TIER_GROUPS[0];
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, title: "Pemula Hemat", minXp: 0, maxXp: 100, icon: "🌱", tierId: "bronze" },
  { level: 2, title: "Pencatat Pemula", minXp: 100, maxXp: 250, icon: "👛", tierId: "bronze" },
  { level: 3, title: "Pencatat Bijak", minXp: 250, maxXp: 450, icon: "🪙", tierId: "bronze" },
  { level: 4, title: "Penjaga Dompet", minXp: 450, maxXp: 700, icon: "👝", tierId: "bronze" },
  { level: 5, title: "Penjaga Anggaran", minXp: 700, maxXp: 1000, icon: "🛡️", tierId: "silver" },
  { level: 6, title: "Pengamat Arus Kas", minXp: 1000, maxXp: 1400, icon: "🔍", tierId: "silver" },
  { level: 7, title: "Perencana Finansial", minXp: 1400, maxXp: 1900, icon: "📜", tierId: "silver" },
  { level: 8, title: "Strategis Finansial", minXp: 1900, maxXp: 2500, icon: "♟️", tierId: "silver" },
  { level: 9, title: "Disiplin Tangguh", minXp: 2500, maxXp: 3200, icon: "⚡", tierId: "gold" },
  { level: 10, title: "Pejuang Bebas Utang", minXp: 3200, maxXp: 4000, icon: "🗝️", tierId: "gold" },
  { level: 11, title: "Arsitek Keuangan", minXp: 4000, maxXp: 5000, icon: "🏛️", tierId: "gold" },
  { level: 12, title: "Penjelajah Dana", minXp: 5000, maxXp: 6200, icon: "🧭", tierId: "gold" },
  { level: 13, title: "Manajer Moneter", minXp: 6200, maxXp: 7600, icon: "⚖️", tierId: "platinum" },
  { level: 14, title: "Pakar Alokasi", minXp: 7600, maxXp: 9200, icon: "📊", tierId: "platinum" },
  { level: 15, title: "Penjinak Inflasi", minXp: 9200, maxXp: 11000, icon: "🐉", tierId: "platinum" },
  { level: 16, title: "Pengendali Cashflow", minXp: 11000, maxXp: 13000, icon: "🌊", tierId: "platinum" },
  { level: 17, title: "Penabung Legendaris", minXp: 13000, maxXp: 15500, icon: "🏆", tierId: "immortal" },
  { level: 18, title: "Master Keuangan", minXp: 15500, maxXp: 18500, icon: "🔮", tierId: "immortal" },
  { level: 19, title: "Grandmaster Finansial", minXp: 18500, maxXp: 22000, icon: "🌟", tierId: "immortal" },
  { level: 20, title: "Immortal Finansial", minXp: 22000, maxXp: null, icon: "⚜️", tierId: "immortal" },
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
