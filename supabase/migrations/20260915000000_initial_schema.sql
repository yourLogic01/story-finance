-- Story Finance: Initial PostgreSQL Schema & RLS Policies
-- Migration: 20260915000000_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. PROFILES TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  currency TEXT NOT NULL DEFAULT 'IDR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

---------------------------------------------------------
-- 2. CATEGORIES TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system defaults
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  icon TEXT NOT NULL DEFAULT 'tag',
  color TEXT NOT NULL DEFAULT '#10B981',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view default categories and own categories"
  ON public.categories FOR SELECT
  USING (is_default = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = false);

---------------------------------------------------------
-- 3. TRANSACTIONS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);

---------------------------------------------------------
-- 4. BUDGETS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE, -- NULL for global monthly budget
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  calculation_mode TEXT NOT NULL CHECK (calculation_mode IN ('fixed', 'percentage')),
  target_value NUMERIC(15, 2) NOT NULL CHECK (target_value > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, category_id, month, year)
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id);

---------------------------------------------------------
-- 5. GAMIFICATION PROFILES TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gamification_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1),
  last_logged_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own gamification profile"
  ON public.gamification_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification profile"
  ON public.gamification_profiles FOR UPDATE
  USING (auth.uid() = user_id);

---------------------------------------------------------
-- 6. BADGES & USER BADGES
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 50
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  TO authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlocked badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

---------------------------------------------------------
-- 7. AUTOMATIC USER INITIALIZATION TRIGGER
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );

  -- Insert into gamification_profiles
  INSERT INTO public.gamification_profiles (user_id, current_streak, longest_streak, total_xp, current_level)
  VALUES (new.id, 0, 0, 0, 1);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

---------------------------------------------------------
-- 8. DEFAULT SEED DATA (System Categories & Badges)
---------------------------------------------------------
INSERT INTO public.categories (name, type, icon, color, is_default) VALUES
  ('Makan & Minum', 'expense', 'coffee', '#F59E0B', true),
  ('Belanja Harian', 'expense', 'shopping-cart', '#10B981', true),
  ('Transportasi', 'expense', 'bus', '#3B82F6', true),
  ('Tagihan & Utilitas', 'expense', 'file-text', '#6366F1', true),
  ('Self-Reward & Hobi', 'expense', 'sparkles', '#EC4899', true),
  ('Kesehatan', 'expense', 'heart-pulse', '#EF4444', true),
  ('Lainnya (Pengeluaran)', 'expense', 'tag', '#6B7280', true),
  ('Gaji Bulanan', 'income', 'briefcase', '#10B981', true),
  ('Bonus & Freelance', 'income', 'trending-up', '#06B6D4', true),
  ('Investasi', 'income', 'dollar-sign', '#8B5CF6', true),
  ('Lainnya (Pemasukan)', 'income', 'plus-circle', '#6B7280', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.badges (id, title, description, icon, xp_reward) VALUES
  ('first_log', 'Pencatat Pertama', 'Mencatat transaksi pertama Anda di Story Finance', 'award', 50),
  ('streak_3', 'Pemanasan 3 Hari', 'Mencatat transaksi 3 hari berturut-turut', 'flame', 75),
  ('streak_7', 'Pejuang 7 Hari', 'Konsisten mencatat keuangan selama seminggu penuh', 'zap', 150),
  ('streak_30', 'Master Disiplin 30 Hari', 'Mencatat keuangan selama 30 hari tanpa putus', 'crown', 500),
  ('self_reward_safe', 'Self-Reward Terkendali', 'Berhasil menjaga pengeluaran self-reward di bawah batas budget bulan ini', 'shield-check', 100),
  ('budget_hero', 'Pahlawan Anggaran', 'Total pengeluaran bulan berjalan tidak melebihi rencana budget', 'star', 200)
ON CONFLICT DO NOTHING;
