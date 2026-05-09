
-- One-time-use stream playback tokens
CREATE TABLE public.stream_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  episode_id UUID NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stream_tokens_token_hash ON public.stream_tokens(token_hash);
CREATE INDEX idx_stream_tokens_expires ON public.stream_tokens(expires_at);

ALTER TABLE public.stream_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access (no client policies needed - default deny)
CREATE POLICY "Users can view own stream tokens"
  ON public.stream_tokens FOR SELECT
  USING (user_id = auth.uid());
