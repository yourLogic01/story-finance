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
    id: "ten_logs",
    title: "Langkah Pertama",
    description: "Berhasil mencatat 10 transaksi di Story Finance",
    icon: "target",
    xp_reward: 50,
  },
  {
    id: "half_century",
    title: "Konsistensi 50 Log",
    description: "Berhasil mencatat 50 transaksi secara akumulatif",
    icon: "sparkles",
    xp_reward: 100,
  },
  {
    id: "century_club",
    title: "Kolektor 100 Log",
    description: "Mencapai rekor pencatatan 100 transaksi",
    icon: "layers",
    xp_reward: 250,
  },
  {
    id: "income_logger",
    title: "Pencatat Rezeki",
    description: "Mencatat transaksi pemasukan pertama Anda",
    icon: "trending-up",
    xp_reward: 50,
  },
  {
    id: "budget_builder",
    title: "Arsitek Anggaran",
    description: "Mengatur batas anggaran kategori pertama kali",
    icon: "pie-chart",
    xp_reward: 75,
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
    id: "streak_14",
    title: "Pejuang 2 Minggu",
    description: "Konsisten mencatat keuangan selama 14 hari berturut-turut",
    icon: "flame",
    xp_reward: 200,
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
  {
    id: "no_spend_first",
    title: "Puasa Jajan Pertama",
    description: "Berhasil lewati 1 hari tanpa keluar uang sepeser pun",
    icon: "shield",
    xp_reward: 50,
  },
  {
    id: "no_spend_7",
    title: "Disiplin Hemat 7 Hari",
    description: "Tercatat 7 hari tanpa pengeluaran sama sekali",
    icon: "shield-check",
    xp_reward: 150,
  },
  {
    id: "wishlist_first",
    title: "Penebus Impian",
    description: "Berhasil menabung dan menebus 1 barang impian di Wishlist Bag",
    icon: "gift",
    xp_reward: 100,
  },
  {
    id: "wishlist_collector",
    title: "Kolektor Impian",
    description: "Berhasil menebus 3 barang impian dari Wishlist Bag",
    icon: "trophy",
    xp_reward: 250,
  },
];

export interface BadgeEvaluationContext {
  totalTransactions: number;
  currentStreak: number;
  hasIncomeTransaction?: boolean;
  hasBudgetConfigured?: boolean;
  isSelfRewardSafe?: boolean;
  isBudgetHero?: boolean;
  noSpendDaysCount?: number;
  purchasedWishlistCount?: number;
}

/**
 * Determine which badge IDs are earned given the user's current metrics.
 */
export function evaluateEligibleBadges(context: BadgeEvaluationContext): string[] {
  const eligibleIds: string[] = [];

  // 1. Transaction count milestones
  if (context.totalTransactions >= 1) eligibleIds.push("first_log");
  if (context.totalTransactions >= 10) eligibleIds.push("ten_logs");
  if (context.totalTransactions >= 50) eligibleIds.push("half_century");
  if (context.totalTransactions >= 100) eligibleIds.push("century_club");

  // 2. Streaks
  if (context.currentStreak >= 3) eligibleIds.push("streak_3");
  if (context.currentStreak >= 7) eligibleIds.push("streak_7");
  if (context.currentStreak >= 14) eligibleIds.push("streak_14");
  if (context.currentStreak >= 30) eligibleIds.push("streak_30");

  // 3. Special actions & budgets
  if (context.hasIncomeTransaction) eligibleIds.push("income_logger");
  if (context.hasBudgetConfigured) eligibleIds.push("budget_builder");
  if (context.isSelfRewardSafe) eligibleIds.push("self_reward_safe");
  if (context.isBudgetHero) eligibleIds.push("budget_hero");

  // 4. No-Spend Days milestones
  if ((context.noSpendDaysCount || 0) >= 1) eligibleIds.push("no_spend_first");
  if ((context.noSpendDaysCount || 0) >= 7) eligibleIds.push("no_spend_7");

  // 5. Wishlist milestones
  if ((context.purchasedWishlistCount || 0) >= 1) eligibleIds.push("wishlist_first");
  if ((context.purchasedWishlistCount || 0) >= 3) eligibleIds.push("wishlist_collector");

  return eligibleIds;
}

