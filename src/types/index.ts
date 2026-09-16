export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  currency: string;
  reminder_enabled?: boolean;
  reminder_time?: string;
  created_at: string;
  updated_at: string;
}

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  month: number;
  year: number;
  calculation_mode: "fixed" | "percentage";
  target_value: number;
  created_at: string;
  updated_at: string;
}

export interface GamificationProfile {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
  current_level: number;
  last_logged_date: string | null;
  updated_at: string;
}

export interface NoSpendDay {
  id: string;
  user_id: string;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export type TransactionType = "income" | "expense";
export type BudgetMode = "fixed" | "percentage";
export type FinancialMood = "happy" | "neutral" | "worried";

export interface TransactionWithCategory extends Transaction {
  category: Category;
}

export interface MonthlySummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  financialMood: FinancialMood;
  categoryBreakdowns: {
    category: Category;
    totalAmount: number;
    percentageOfTotal: number;
  }[];
}

export interface SelfRewardAllowance {
  configured: boolean;
  mode: BudgetMode;
  targetValue: number;
  effectiveLimit: number;
  totalSpent: number;
  remainingAllowance: number;
  percentageUsed: number;
  healthStatus: "safe" | "warning" | "overbudget";
}

export interface GamificationState {
  profile: GamificationProfile;
  levelTitle: string;
  nextLevelXp: number;
  progressPercent: number;
  badges: (Badge & { unlocked: boolean; unlockedAt: string | null })[];
}

export type WishlistStatus = "saving" | "ready" | "purchased";

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  icon: string;
  category_id: string | null;
  category?: Category | null;
  status: WishlistStatus;
  created_at: string;
  purchased_at: string | null;
}

