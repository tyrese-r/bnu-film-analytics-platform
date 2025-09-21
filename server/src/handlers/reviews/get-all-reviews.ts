import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";

export const getAllReviews = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("Fetching reviews...");

    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(
        `
      *,
      movie:movie_id(id, title, director, release_date, poster_url)
    `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Reviews fetch error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw HttpError("Failed to fetch reviews", 500);
    }

    const response: ApiResponse<any[]> = {
      success: true,
      data: reviews,
    };

    res.json(response);
  }
);
