import { Response } from "express";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import {
  getMovieByImdbId,
  getMovieByTitle,
  transformOMDBToMovie,
} from "@/services/omdbService";
import { ApiResponse, Movie, CreateMovieRequest } from "@/types";
import { validateCreateMovie } from "@/validators/movies";
import { supabase, createUserClient } from "@/lib/supabase";

export const createMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const body: CreateMovieRequest = validateCreateMovie(req.body);
    const { title, year, imdb_id } = body;

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const userSupabase = createUserClient(token!);

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
        message: "Movie already exists in the database",
      };
      res.json(response);
      return;
    }

    const { data: savedMovie, error } = await userSupabase
      .from("movies")
      .insert([movie])
      .select()
      .single();

    if (error) {
      throw HttpError("Failed to save movie", 500);
    }

    const response: ApiResponse<Movie> = {
      success: true,
      data: savedMovie,
      message: "Movie Successfully created to the database",
    };

    res.json(response);
  }
);
