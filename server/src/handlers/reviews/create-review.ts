import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, CreateReviewRequest } from "@/types";
import { validateCreateReview } from "@/validators/reviews";
import { supabase } from "@/lib/supabase";

export const createReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    console.log("Creating review...");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);

    const body: CreateReviewRequest = validateCreateReview(req.body);
    const { movie_id, rating, title, comment } = body;

    // Check if movie exists
    const { data: movie } = await supabase
      .from("movies")
      .select("id")
      .eq("id", movie_id)
      .single();

    if (!movie) {
      throw HttpError("Movie not found", 404);
    }

    // Check if user already reviewed this movie
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", req.user!.id)
      .eq("movie_id", movie_id)
      .single();

    if (existingReview) {
      throw HttpError("You have already reviewed this movie", 400);
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

    // Create review
    const { data: review, error } = await userSupabase
      .from("reviews")
      .insert([
        {
          user_id: req.user!.id,
          movie_id,
          rating,
          title,
          comment,
        },
      ])
      .select("*")
      .single();

    if (error) {
      console.log("Review creation error:", error);
      console.log("Error details:", JSON.stringify(error, null, 2));
      throw HttpError("Failed to create review", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
      message: "Review created successfully",
    };

    res.status(201).json(response);
  }
);
