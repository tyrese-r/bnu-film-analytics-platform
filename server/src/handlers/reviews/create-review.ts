import { Response } from "express";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, CreateReviewRequest } from "@/types";
import { validateCreateReview } from "@/validators/reviews";
import { supabase, createUserClient } from "@/lib/supabase";

export const createReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const body: CreateReviewRequest = validateCreateReview(req.body);
    const { movie_id, rating, title, comment } = body;

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const userSupabase = createUserClient(token!);

    const { data: movie } = await supabase
      .from("movies")
      .select("id")
      .eq("id", movie_id)
      .single();

    if (!movie) {
      throw HttpError("Movie not found", 404);
    }

    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", req.user!.id)
      .eq("movie_id", movie_id)
      .single();

    if (existingReview) {
      throw HttpError(
        "This movie has already been reviewed by current user",
        400
      );
    }

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
      throw HttpError("Unsuccessful create review", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
      message: "Review created successfully",
    };

    res.status(201).json(response);
  }
);
