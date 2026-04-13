
-- Create content type enum
CREATE TYPE public.content_type AS ENUM ('movie', 'series');
CREATE TYPE public.content_status AS ENUM ('ongoing', 'completed', 'upcoming');

-- Genres table
CREATE TABLE public.genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Genres are publicly readable" ON public.genres FOR SELECT USING (true);

-- Content table
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type public.content_type NOT NULL DEFAULT 'series',
  release_year INT,
  rating NUMERIC(3,1) DEFAULT 0,
  poster_url TEXT,
  banner_url TEXT,
  thumbnail_url TEXT,
  duration_minutes INT,
  language TEXT DEFAULT 'Japanese',
  status public.content_status DEFAULT 'ongoing',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content is publicly readable" ON public.content FOR SELECT USING (true);

-- Content-Genres junction
CREATE TABLE public.content_genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  genre_id UUID NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  UNIQUE(content_id, genre_id)
);
ALTER TABLE public.content_genres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content genres are publicly readable" ON public.content_genres FOR SELECT USING (true);

-- Episodes table
CREATE TABLE public.episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  season_number INT NOT NULL DEFAULT 1,
  episode_number INT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Episodes are publicly readable" ON public.episodes FOR SELECT USING (true);

-- Video servers (restricted - no public access)
CREATE TABLE public.video_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  server_name TEXT NOT NULL DEFAULT 'default',
  stream_url TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT '1080p',
  language TEXT NOT NULL DEFAULT 'Japanese',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.video_servers ENABLE ROW LEVEL SECURITY;
-- No public policies - access via backend only

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Watchlist table
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watchlist" ON public.watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own watchlist" ON public.watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from own watchlist" ON public.watchlist FOR DELETE USING (auth.uid() = user_id);

-- Watch history table
CREATE TABLE public.watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_id UUID NOT NULL REFERENCES public.episodes(id) ON DELETE CASCADE,
  progress_seconds INT NOT NULL DEFAULT 0,
  total_seconds INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, episode_id)
);
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own watch history" ON public.watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watch history" ON public.watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watch history" ON public.watch_history FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_featured ON public.content(featured);
CREATE INDEX idx_content_genres_content ON public.content_genres(content_id);
CREATE INDEX idx_content_genres_genre ON public.content_genres(genre_id);
CREATE INDEX idx_episodes_content ON public.episodes(content_id);
CREATE INDEX idx_video_servers_episode ON public.video_servers(episode_id);
CREATE INDEX idx_watchlist_user ON public.watchlist(user_id);
CREATE INDEX idx_watch_history_user ON public.watch_history(user_id);

-- Seed genres
INSERT INTO public.genres (name, slug) VALUES
  ('Action', 'action'),
  ('Adventure', 'adventure'),
  ('Comedy', 'comedy'),
  ('Drama', 'drama'),
  ('Fantasy', 'fantasy'),
  ('Horror', 'horror'),
  ('Mecha', 'mecha'),
  ('Mystery', 'mystery'),
  ('Romance', 'romance'),
  ('Sci-Fi', 'sci-fi'),
  ('Slice of Life', 'slice-of-life'),
  ('Sports', 'sports'),
  ('Supernatural', 'supernatural'),
  ('Thriller', 'thriller'),
  ('Cyberpunk', 'cyberpunk');
