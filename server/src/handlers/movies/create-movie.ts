import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import {
  getMovieByImdbId,
  getMovieByTitle,
  transformOMDBToMovie,
} from "@/services/omdbService";
import { ApiResponse, Movie, CreateMovieRequest } from "@/types";
import { validateCreateMovie } from "@/validators/movies";
import { supabase } from "@/lib/supabase";

export const createMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body: CreateMovieRequest = validateCreateMovie(req.body);
    const { title, year, imdb_id } = body;

    let movieData: any;

    if (imdb_id) {
      movieData = await getMovieByImdbId(imdb_id);
    } else if (title) {
      movieData = await getMovieByTitle(title, year);
    }

    const movie = transformOMDBToMovie(movieData, req.user?.id);

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
