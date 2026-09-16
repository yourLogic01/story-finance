-- Story Finance: Wishlist Bag (Tas Impian & Celengan Virtual RPG)
-- Migration: 20260916000002_wishlist_items.sql

---------------------------------------------------------
-- 1. WISHLIST ITEMS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL CHECK (target_amount > 0),
  saved_amount NUMERIC NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  icon TEXT NOT NULL DEFAULT 'gift',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'saving' CHECK (status IN ('saving', 'ready', 'purchased')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  purchased_at TIMESTAMPTZ
);

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wishlist items"
  ON public.wishlist_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_status
  ON public.wishlist_items(user_id, status);

CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_created
  ON public.wishlist_items(user_id, created_at DESC);

---------------------------------------------------------
-- 2. SEED WISHLIST BADGES
---------------------------------------------------------
INSERT INTO public.badges (id, title, description, icon, xp_reward) VALUES
  ('wishlist_first', 'Penebus Impian', 'Berhasil menabung dan menebus 1 barang impian di Wishlist Bag', 'gift', 100),
  ('wishlist_collector', 'Kolektor Impian', 'Berhasil menebus 3 barang impian dari Wishlist Bag', 'trophy', 250)
ON CONFLICT (id) DO NOTHING;
