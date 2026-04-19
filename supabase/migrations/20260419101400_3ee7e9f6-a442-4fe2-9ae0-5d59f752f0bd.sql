-- Create channel_favorites table for live TV favorite syncing
CREATE TABLE IF NOT EXISTS public.channel_favorites (
  user_id uuid NOT NULL,
  channel_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, channel_id)
);

ALTER TABLE public.channel_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own channel favorites"
  ON public.channel_favorites
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own channel favorites"
  ON public.channel_favorites
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own channel favorites"
  ON public.channel_favorites
  FOR DELETE
  USING (user_id = auth.uid());
