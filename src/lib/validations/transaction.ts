import { z } from "zod";

export const createTransactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Nominal harus berupa angka" })
    .positive("Nominal harus lebih dari 0")
    .max(999_999_999_999, "Nominal melebihi batas wajar"),
  type: z.enum(["income", "expense"], {
    required_error: "Tipe transaksi wajib dipilih",
  }),
  categoryId: z.string().uuid("Kategori tidak valid"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  note: z.string().max(255, "Catatan maksimal 255 karakter").optional().nullable(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
