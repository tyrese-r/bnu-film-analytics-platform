-- Create movies
CREATE TABLE public.movies (
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text,
  director text,
  genre text,
  runtime text,
  description text,
  ratings jsonb,
  youtube_trailer_url text,
  updated_at timestamp with time zone,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  release_date text,
  poster_url text,
  imdb_id text,
  user_id uuid,
  CONSTRAINT movies_pkey PRIMARY KEY (id),
  CONSTRAINT movies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid DEFAULT gen_random_uuid(),
  movie_id uuid DEFAULT gen_random_uuid(),
  rating smallint,
  title text,
  comment text,
  updated_at timestamp with time zone,
  is_public boolean DEFAULT true,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT fk_reviews_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_reviews_movie_id FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);

-- Create saved_movies table
CREATE TABLE public.saved_movies (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid DEFAULT gen_random_uuid(),
  movie_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT saved_movies_pkey PRIMARY KEY (id),
  CONSTRAINT fk_saved_movies_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_saved_movies_movie_id FOREIGN KEY (movie_id) REFERENCES public.movies(id)
);

-- Enable RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_movies ENABLE ROW LEVEL SECURITY;

-- Movies RLS Policies 
CREATE POLICY "Anyone can delete movies" ON public.movies FOR DELETE USING (true);
CREATE POLICY "Anyone can update movies" ON public.movies FOR UPDATE USING (true);
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create movies" ON public.movies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Reviews RLS Policies 
CREATE POLICY "Anyone can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- Saved Movies RLS Policies 
CREATE POLICY "Users can create their own saved movies" ON public.saved_movies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saved movies" ON public.saved_movies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own saved movies" ON public.saved_movies FOR SELECT USING (auth.uid() = user_id);
