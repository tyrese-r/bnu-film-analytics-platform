import { Response } from "express";
import { supabase } from "@/lib/supabase";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";

export const getMyReviews = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
      *,
      movie:movie_id(id, title, release_date, poster_url)
    `
      )
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw HttpError("Failed to fetch your reviews", 500);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: reviews,
    };

    res.json(response);
  }
);
