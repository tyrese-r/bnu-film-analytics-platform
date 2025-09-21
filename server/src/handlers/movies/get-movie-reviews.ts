import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";

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
