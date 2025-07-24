-- Create tables for user data synchronization
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id INTEGER NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('movie', 'tv', 'person')),
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE TABLE public.user_watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id INTEGER NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('movie', 'tv')),
  item_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id, item_type)
);

CREATE TABLE public.user_watched (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id INTEGER NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('movie', 'tv')),
  item_data JSONB NOT NULL,
  watched_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 10)
);

-- Enable Row Level Security
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_watched ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON public.user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own favorites" ON public.user_favorites
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_watchlist
CREATE POLICY "Users can view own watchlist" ON public.user_watchlist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watchlist" ON public.user_watchlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watchlist" ON public.user_watchlist
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watchlist" ON public.user_watchlist
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_watched
CREATE POLICY "Users can view own watched" ON public.user_watched
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own watched" ON public.user_watched
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own watched" ON public.user_watched
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own watched" ON public.user_watched
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_item ON public.user_favorites(item_id, item_type);
CREATE INDEX idx_user_watchlist_user_id ON public.user_watchlist(user_id);
CREATE INDEX idx_user_watchlist_item ON public.user_watchlist(item_id, item_type);
CREATE INDEX idx_user_watched_user_id ON public.user_watched(user_id);
CREATE INDEX idx_user_watched_item ON public.user_watched(item_id, item_type);