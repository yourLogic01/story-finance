import { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type GamificationProfile = Database["public"]["Tables"]["gamification_profiles"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type UserBadge = Database["public"]["Tables"]["user_badges"]["Row"];

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
