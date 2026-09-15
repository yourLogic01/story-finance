import { z } from "zod";

export const upsertBudgetSchema = z
  .object({
    categoryId: z.string().uuid().nullable().optional(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020),
    calculationMode: z.enum(["fixed", "percentage"]),
    targetValue: z.number().positive("Nominal / target anggaran harus lebih dari 0"),
  })
  .refine(
    (data) => {
      if (data.calculationMode === "percentage") {
        return data.targetValue > 0 && data.targetValue <= 100;
      }
      return true;
    },
    {
      message: "Persentase anggaran harus berada di antara 1% dan 100%",
      path: ["targetValue"],
    }
  );

export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
