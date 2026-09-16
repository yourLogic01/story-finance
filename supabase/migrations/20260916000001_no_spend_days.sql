-- Story Finance: No-Spend Days (Hari Bebas Belanja / Puasa Jajan)
-- Migration: 20260916000001_no_spend_days.sql

---------------------------------------------------------
-- 1. NO SPEND DAYS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.no_spend_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, date)
);

ALTER TABLE public.no_spend_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own no spend days"
  ON public.no_spend_days
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_no_spend_days_user_date
  ON public.no_spend_days(user_id, date DESC);

---------------------------------------------------------
-- 2. SEED NO-SPEND BADGES
---------------------------------------------------------
INSERT INTO public.badges (id, title, description, icon, xp_reward) VALUES
  ('no_spend_first', 'Puasa Jajan Pertama', 'Berhasil lewati 1 hari tanpa keluar uang sepeser pun', 'shield', 50),
  ('no_spend_7', 'Disiplin Hemat 7 Hari', 'Tercatat 7 hari tanpa pengeluaran sama sekali', 'shield-check', 150)
ON CONFLICT (id) DO NOTHING;
