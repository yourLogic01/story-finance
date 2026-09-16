-- Story Finance: Push Notifications & Daily Reminder Preferences
-- Migration: 20260916000000_push_notifications.sql

---------------------------------------------------------
-- 1. ADD REMINDER PREFERENCES TO PROFILES
---------------------------------------------------------
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_time TEXT NOT NULL DEFAULT '20:00';

---------------------------------------------------------
-- 2. PUSH SUBSCRIPTIONS TABLE
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions(user_id);
