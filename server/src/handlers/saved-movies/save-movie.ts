import { Response } from "express";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { supabase, createUserClient } from "@/lib/supabase";

export const saveMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { movie_id } = req.body;

    if (!movie_id) {
      throw HttpError("Movie ID is required", 400);
    }

    const { data: movie } = await supabase
      .from("movies")
      .select("id")
      .eq("id", movie_id)
      .single();

    if (!movie) {
      throw HttpError("Movie not found", 404);
    }

    const { data: existingSavedMovie } = await supabase
      .from("saved_movies")
      .select("id")
      .eq("user_id", req.user!.id)
      .eq("movie_id", movie_id)
      .single();

    if (existingSavedMovie) {
      throw HttpError("You have already saved this movie", 400);
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const userSupabase = createUserClient(token!);

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

    const response = {
      success: true,
      data: savedMovie,
      message: "Movie saved successfully",
    };

    res.status(201).json(response);
  }
);
