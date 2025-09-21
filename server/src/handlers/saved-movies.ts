import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { authenticateUser, AuthenticatedRequest } from "@/middleware/auth";
import { asyncHandler, HttpError } from "@/middleware/error-handler";
import { ApiResponse } from "@/types";

// GET /saved-movies - Get current user's saved movies
export const getMySavedMovies = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
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

    const { data: savedMovies, error } = await userSupabase
      .from("saved_movies")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw HttpError("Failed to fetch your saved movies", 500);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: savedMovies,
    };

    res.json(response);
  }
);

// POST /saved-movies - Save a movie
export const saveMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { movie_id } = req.body;

    if (!movie_id) {
      throw HttpError("Movie ID is required", 400);
    }

    // Check if movie exists
    const { data: movie } = await supabase
      .from("movies")
      .select("id")
      .eq("id", movie_id)
      .single();

    if (!movie) {
      throw HttpError("Movie not found", 404);
    }

    // Check if user already saved this movie
    const { data: existingSavedMovie } = await supabase
      .from("saved_movies")
      .select("id")
      .eq("user_id", req.user!.id)
      .eq("movie_id", movie_id)
      .single();

    if (existingSavedMovie) {
      throw HttpError("You have already saved this movie", 400);
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

    const { data: savedMovie, error } = await userSupabase
      .from("saved_movies")
      .insert([
        {
          user_id: req.user!.id,
          movie_id,
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw HttpError("Failed to save movie", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: savedMovie,
      message: "Movie saved successfully",
    };

    res.status(201).json(response);
  }
);

export const deleteSavedMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

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

    const { data: existingSavedMovie } = await userSupabase
      .from("saved_movies")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingSavedMovie) {
      throw HttpError("Saved movie not found", 404);
    }

    if (existingSavedMovie.user_id !== req.user!.id) {
      throw HttpError(
        "You do not have permission to delete this saved movie",
        403
      );
    }

    const { error } = await userSupabase
      .from("saved_movies")
      .delete()
      .eq("id", id);

    if (error) {
      throw HttpError("Failed to delete saved movie", 500);
    }

    const response: ApiResponse = {
      success: true,
      message: "Saved movie deleted successfully",
    };

    res.json(response);
  }
);
