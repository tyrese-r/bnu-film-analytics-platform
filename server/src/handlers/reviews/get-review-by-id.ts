import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";

export const getReviewById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: review, error } = await supabase
      .from("reviews")
      .select(
        `
      *,
      user:user_id(id, email),
      movie:movie_id(id, title, release_date, poster_url)
    `
      )
      .eq("id", id)
      .single();

    if (error || !review) {
      throw HttpError("Review not found", 404);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
    };

    res.json(response);
  }
);
