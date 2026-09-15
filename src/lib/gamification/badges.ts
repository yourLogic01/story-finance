/**
 * Gamification Badges Milestone Evaluator & Definitions
 */

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export const KNOWN_BADGES: BadgeDefinition[] = [
  {
    id: "first_log",
    title: "Pencatat Pertama",
    description: "Mencatat transaksi pertama Anda di Story Finance",
    icon: "award",
    xp_reward: 50,
  },
  {
    id: "streak_3",
    title: "Pemanasan 3 Hari",
    description: "Mencatat transaksi 3 hari berturut-turut",
    icon: "flame",
    xp_reward: 75,
  },
  {
    id: "streak_7",
    title: "Pejuang 7 Hari",
    description: "Konsisten mencatat keuangan selama seminggu penuh",
    icon: "zap",
    xp_reward: 150,
  },
  {
    id: "streak_30",
    title: "Master Disiplin 30 Hari",
    description: "Mencatat keuangan selama 30 hari tanpa putus",
    icon: "crown",
    xp_reward: 500,
  },
  {
    id: "self_reward_safe",
    title: "Self-Reward Terkendali",
    description: "Berhasil menjaga pengeluaran self-reward di bawah batas budget bulan ini",
    icon: "shield-check",
    xp_reward: 100,
  },
  {
    id: "budget_hero",
    title: "Pahlawan Anggaran",
    description: "Total pengeluaran bulan berjalan tidak melebihi rencana budget",
    icon: "star",
    xp_reward: 200,
  },
];

export interface BadgeEvaluationContext {
  totalTransactions: number;
  currentStreak: number;
  isSelfRewardSafe?: boolean;
  isBudgetHero?: boolean;
}

/**
 * Determine which badge IDs are earned given the user's current metrics.
 */
export function evaluateEligibleBadges(context: BadgeEvaluationContext): string[] {
  const eligibleIds: string[] = [];

  // 1. First Log
  if (context.totalTransactions >= 1) {
    eligibleIds.push("first_log");
  }

  // 2. Streaks
  if (context.currentStreak >= 3) {
    eligibleIds.push("streak_3");
  }
  if (context.currentStreak >= 7) {
    eligibleIds.push("streak_7");
  }
  if (context.currentStreak >= 30) {
    eligibleIds.push("streak_30");
  }

  // 3. Budgets
  if (context.isSelfRewardSafe) {
    eligibleIds.push("self_reward_safe");
  }
  if (context.isBudgetHero) {
    eligibleIds.push("budget_hero");
  }

  return eligibleIds;
}
