"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().trim().min(2, "Nama kategori minimal 2 karakter").max(30, "Maksimal 30 karakter"),
  type: z.enum(["expense", "income"]),
  icon: z.string().default("tag"),
  color: z.string().default("#10B981"),
});

export async function createCategory(formData: unknown) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  const parseResult = createCategorySchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.errors[0]?.message || "Data kategori tidak valid",
    };
  }

  const { name, type, icon, color } = parseResult.data;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name,
      type,
      icon,
      color,
      is_default: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Gagal membuat kategori baru.",
    };
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/budgets");

  return { success: true, data };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi. Silakan masuk kembali." };
  }

  // Only allow deleting user's custom categories (not system defaults)
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_default", false);

  if (error) {
    return {
      success: false,
      error: error.message || "Gagal menghapus kategori.",
    };
  }

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/budgets");

  return { success: true };
}
