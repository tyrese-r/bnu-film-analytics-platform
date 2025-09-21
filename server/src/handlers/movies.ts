import { Request, Response } from "express";
import { supabase } from "..//lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { asyncHandler, HttpError } from "@/middleware/error-handler";
import { authenticateUser, AuthenticatedRequest } from "@/middleware/auth";
import {
  searchMovies,
  getMovieByImdbId,
  getMovieByTitle,
  transformOMDBToMovie,
} from "@/services/omdbService";
import { searchTrailer } from "@/services/youtubeService";
import {
  ApiResponse,
  Movie,
  CreateMovieRequest,
  SearchMoviesRequest,
} from "@/types";
import { validateCreateMovie, validateSearchMovies } from "@/validators/movies";

// GET /movies - Get all movies
export const getAllMovies = asyncHandler(
  async (req: Request, res: Response) => {
    let query = supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: movies, error } = await query;

    if (error) {
      throw HttpError("Failed to fetch movies", 500);
    }

    // Fetch trailers for movies that don't have them
    const moviesWithTrailers = await Promise.all(
      (movies || []).map(async (movie: any) => {
        if (!movie.youtube_trailer_url) {
          try {
            const trailerUrl = await searchTrailer(
              movie.title,
              movie.release_date
            );
            if (trailerUrl) {
              // Update the movie in database with trailer URL
              await supabase
                .from("movies")
                .update({ youtube_trailer_url: trailerUrl })
                .eq("id", movie.id);
              movie.youtube_trailer_url = trailerUrl;
            }
          } catch (error) {
            console.error(`Failed to fetch trailer for ${movie.title}:`, error);
          }
        }
        return movie;
      })
    );

    const response: ApiResponse<Movie[]> = {
      success: true,
      data: moviesWithTrailers,
    };

    res.json(response);
  }
);

// GET /movies/:id - Get movie by ID
export const getMovieById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: movie, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !movie) {
      throw HttpError("Movie not found", 404);
    }

    // Fetch trailer if it doesn't exist
    if (!movie.youtube_trailer_url) {
      try {
        const trailerUrl = await searchTrailer(movie.title, movie.release_date);
        if (trailerUrl) {
          // Update the movie in database with trailer URL
          await supabase
            .from("movies")
            .update({ youtube_trailer_url: trailerUrl })
            .eq("id", movie.id);
          movie.youtube_trailer_url = trailerUrl;
        }
      } catch (error) {
        console.error(`Failed to fetch trailer for ${movie.title}:`, error);
      }
    }

    const response: ApiResponse<Movie> = {
      success: true,
      data: movie,
    };

    res.json(response);
  }
);

// POST /movies - Create movie
export const createMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body: CreateMovieRequest = validateCreateMovie(req.body);
    const { title, year, imdb_id } = body;

    let movieData: any;

    if (imdb_id) {
      // Get movie by IMDb ID
      movieData = await getMovieByImdbId(imdb_id);
    } else if (title) {
      // Get movie by title and year
      movieData = await getMovieByTitle(title, year);
    }

    // Transform OMDB data to our movie format
    const movie = transformOMDBToMovie(movieData, req.user?.id);

    // Check if movie already exists
    const { data: existingMovie } = await supabase
      .from("movies")
      .select("*")
      .eq("title", movie.title)
      .eq("release_date", movie.release_date)
      .single();

    if (existingMovie) {
      const response: ApiResponse<Movie> = {
        success: true,
        data: existingMovie,
        message: "Movie already exists",
      };
      res.json(response);
      return;
    }

    // Create Supabase client with user's JWT token for RLS
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Save movie to database
    const { data: savedMovie, error } = await userSupabase
      .from("movies")
      .insert([movie])
      .select()
      .single();

    if (error) {
      console.log("Database insert error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw HttpError("Failed to save movie", 500);
    }

    const response: ApiResponse<Movie> = {
      success: true,
      data: savedMovie,
      message: "Movie created successfully",
    };

    res.json(response);
  }
);

// GET /movies/search/omdb - Search OMDB API
export const searchOMDBMovies = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateSearchMovies(req.query);
    const { query: searchQuery } = query;

    const movies = await searchMovies(searchQuery);

    const response: ApiResponse<any[]> = {
      success: true,
      data: movies,
      message: "Search completed successfully",
    };

    res.json(response);
  }
);

// GET /movies/:id/reviews - Get reviews for a movie
export const getMovieReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Check if movie exists
    const { data: movie } = await supabase
      .from("movies")
      .select("id")
      .eq("id", id)
      .single();

    if (!movie) {
      throw HttpError("Movie not found", 404);
    }

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("movie_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      throw HttpError("Failed to fetch reviews", 500);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: reviews,
    };

    res.json(response);
  }
);
