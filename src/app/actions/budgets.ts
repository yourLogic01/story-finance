"use server";

import { createClient } from "@/lib/supabase/server";
import { upsertBudgetSchema } from "@/lib/validations/budget";
import { getMonthDateRange } from "@/lib/utils/date";
import { SelfRewardAllowance, Category, BudgetMode } from "@/types";
import { revalidatePath } from "next/cache";

export interface BudgetWithSpending {
  id: string;
  user_id: string;
  category_id: string | null;
  month: number;
  year: number;
  calculation_mode: BudgetMode;
  target_value: number;
  effective_limit: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  category: Category | null;
}

export async function upsertBudget(formData: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  const parseResult = upsertBudgetSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "Data anggaran tidak valid",
    };
  }

  const { categoryId, month, year, calculationMode, targetValue } = parseResult.data;

  // Check if existing budget exists
  let query = supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  } else {
    query = query.is("category_id", null);
  }

  const { data: existing } = await query.maybeSingle();

  let responseData;
  if (existing) {
    const { data, error } = await supabase
      .from("budgets")
      .update({
        calculation_mode: calculationMode,
        target_value: targetValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("*, category:categories(*)")
      .single();

    if (error) {
      return { success: false, error: error.message || "Gagal memperbarui anggaran." };
    }
    responseData = data;
  } else {
    const { data, error } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: categoryId || null,
        month,
        year,
        calculation_mode: calculationMode,
        target_value: targetValue,
      })
      .select("*, category:categories(*)")
      .single();

    if (error) {
      return { success: false, error: error.message || "Gagal menyimpan anggaran." };
    }
    responseData = data;
  }

  revalidatePath("/");
  revalidatePath("/budgets");

  return { success: true, data: responseData };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message || "Gagal menghapus anggaran." };
  }

  revalidatePath("/");
  revalidatePath("/budgets");

  return { success: true };
}

export async function getBudgets(
  year: number,
  month: number
): Promise<{ budgets: BudgetWithSpending[]; totalIncome: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { budgets: [], totalIncome: 0 };
  }

  const { startDate, endDate } = getMonthDateRange(year, month);

  // 1. Fetch user's budgets for the month
  const { data: rawBudgets, error: budgetError } = await supabase
    .from("budgets")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year);

  if (budgetError || !rawBudgets) {
    console.error("Error fetching budgets:", budgetError);
    return { budgets: [], totalIncome: 0 };
  }

  // 2. Fetch all month's transactions to calculate spending per category & total income
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type, category_id")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  let totalIncome = 0;
  const spendingPerCategory = new Map<string, number>();

  for (const tx of transactions || []) {
    const amt = Number(tx.amount);
    if (tx.type === "income") {
      totalIncome += amt;
    } else {
      const catId = tx.category_id;
      spendingPerCategory.set(catId, (spendingPerCategory.get(catId) || 0) + amt);
    }
  }

  // 3. Map budgets with calculated spendings
  const budgets: BudgetWithSpending[] = rawBudgets.map((b) => {
    const target = Number(b.target_value);
    const mode = b.calculation_mode as BudgetMode;
    const effectiveLimit =
      mode === "percentage" ? (target / 100) * totalIncome : target;

    const spent = b.category_id
      ? spendingPerCategory.get(b.category_id) || 0
      : Array.from(spendingPerCategory.values()).reduce((acc, curr) => acc + curr, 0);

    const remaining = Math.max(0, effectiveLimit - spent);
    const percentageUsed =
      effectiveLimit > 0 ? Math.round((spent / effectiveLimit) * 100) : 0;

    return {
      id: b.id,
      user_id: b.user_id,
      category_id: b.category_id,
      month: b.month,
      year: b.year,
      calculation_mode: mode,
      target_value: target,
      effective_limit: effectiveLimit,
      spent,
      remaining,
      percentage_used: percentageUsed,
      category: b.category as unknown as Category | null,
    };
  });

  return { budgets, totalIncome };
}

export async function getSelfRewardAllowance(
  year: number,
  month: number
): Promise<SelfRewardAllowance> {
  const defaultAllowance: SelfRewardAllowance = {
    configured: false,
    mode: "fixed",
    targetValue: 0,
    effectiveLimit: 0,
    totalSpent: 0,
    remainingAllowance: 0,
    percentageUsed: 0,
    healthStatus: "safe",
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return defaultAllowance;
  }

  // Find Self-Reward Category
  const { data: selfRewardCategory } = await supabase
    .from("categories")
    .select("id, name")
    .ilike("name", "%Self-Reward%")
    .maybeSingle();

  if (!selfRewardCategory) {
    return defaultAllowance;
  }

  // Look up configured budget for this category
  const { data: budget } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("category_id", selfRewardCategory.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (!budget) {
    return defaultAllowance;
  }

  const { startDate, endDate } = getMonthDateRange(year, month);

  // Fetch month transactions to calculate income (for percentage mode) and actual Self-Reward spending
  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, type, category_id")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate);

  let totalIncome = 0;
  let totalSpent = 0;

  for (const tx of transactions || []) {
    const amt = Number(tx.amount);
    if (tx.type === "income") {
      totalIncome += amt;
    } else if (tx.category_id === selfRewardCategory.id) {
      totalSpent += amt;
    }
  }

  const targetValue = Number(budget.target_value);
  const mode = budget.calculation_mode as BudgetMode;
  const effectiveLimit =
    mode === "percentage" ? (targetValue / 100) * totalIncome : targetValue;

  const remainingAllowance = Math.max(0, effectiveLimit - totalSpent);
  const percentageUsed =
    effectiveLimit > 0 ? Math.round((totalSpent / effectiveLimit) * 100) : 0;

  let healthStatus: "safe" | "warning" | "overbudget" = "safe";
  if (totalSpent > effectiveLimit) {
    healthStatus = "overbudget";
  } else if (percentageUsed >= 80) {
    healthStatus = "warning";
  }

  return {
    configured: true,
    mode,
    targetValue,
    effectiveLimit,
    totalSpent,
    remainingAllowance,
    percentageUsed,
    healthStatus,
  };
}
