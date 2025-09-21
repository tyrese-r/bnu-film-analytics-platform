export type User = {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
};

export type CreateUserRequest = {
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type Movie = {
  id: string;
  title: string;
  director: string;
  release_date: string;
  genre: string;
  runtime: string;
  description: string;
  ratings: Rating[];
  youtube_trailer_url?: string;
  created_at: string;
  updated_at: string;
};

export type Rating = {
  source: string;
  value: string;
};

export type MovieApiResponse = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: Rating[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
};

export type Request = {
  title?: string;
  year?: string;
  imdb_id?: string;
};

export type SearchMoviesRequest = {
  query: string;
  year?: string;
};

export type CreateMovieRequest = {
  title?: string;
  year?: string;
  imdb_id?: string;
};

export type Review = {
  id: string;
  user_id: string;
  movie_id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: User;
  movie?: Movie;
};

export type CreateReviewRequest = {
  movie_id: string;
  rating: number;
  title: string;
  comment: string;
};

export type UpdateReviewRequest = {
  rating?: number;
  title?: string;
  comment?: string;
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};
