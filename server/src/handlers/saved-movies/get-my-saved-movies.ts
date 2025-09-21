import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { supabase, createUserClient } from "@/lib/supabase";

export const getMySavedMovies = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const userSupabase = createUserClient(token!);

    const { data: savedMovies, error } = await userSupabase
      .from("saved_movies")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw HttpError("Failed to fetch your saved movies", 500);
    }

    const response = {
      success: true,
      data: savedMovies,
    };

    res.json(response);
  }
);
