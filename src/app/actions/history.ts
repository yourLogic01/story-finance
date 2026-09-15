"use server";

import { createClient } from "@/lib/supabase/server";
import { getMonthDateRange } from "@/lib/utils/date";
import { Category, TransactionWithCategory } from "@/types";

export interface TransactionFilter {
  year?: number;
  month?: number;
  categoryId?: string | null;
  type?: "income" | "expense" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetTransactionsResult {
  transactions: TransactionWithCategory[];
  totalCount: number;
  hasMore: boolean;
  page: number;
}

export async function getTransactions(
  filter: TransactionFilter = {}
): Promise<GetTransactionsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      transactions: [],
      totalCount: 0,
      hasMore: false,
      page: filter.page || 1,
    };
  }

  const page = filter.page && filter.page > 0 ? filter.page : 1;
  const limit = filter.limit && filter.limit > 0 ? filter.limit : 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("transactions")
    .select(
      `
      id,
      user_id,
      category_id,
      type,
      amount,
      date,
      note,
      created_at,
      updated_at,
      category:categories(id, user_id, name, type, icon, color, is_default, created_at)
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id);

  // Filter by month & year if provided
  if (filter.year && filter.month) {
    const { startDate, endDate } = getMonthDateRange(filter.year, filter.month);
    query = query.gte("date", startDate).lte("date", endDate);
  }

  // Filter by category
  if (filter.categoryId) {
    query = query.eq("category_id", filter.categoryId);
  }

  // Filter by transaction type
  if (filter.type && filter.type !== "all") {
    query = query.eq("type", filter.type);
  }

  // Filter by search keyword on note
  if (filter.search && filter.search.trim().length > 0) {
    query = query.ilike("note", `%${filter.search.trim()}%`);
  }

  // Order latest first
  query = query
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching transactions:", error);
    return {
      transactions: [],
      totalCount: 0,
      hasMore: false,
      page,
    };
  }

  const totalCount = count || 0;
  const hasMore = totalCount > to + 1;

  const transactions = (data || []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    type: row.type,
    amount: Number(row.amount),
    date: row.date,
    note: row.note,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category: row.category as unknown as Category,
  })) as TransactionWithCategory[];

  return {
    transactions,
    totalCount,
    hasMore,
    page,
  };
}
