import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, UpdateReviewRequest } from "@/types";
import { validateUpdateReview } from "@/validators/reviews";
import { supabase } from "@/lib/supabase";

export const updateReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const body: UpdateReviewRequest = validateUpdateReview(req.body);

    // Check if review exists and user owns it
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingReview) {
      throw HttpError(
        "Review not found or you do not have permission to edit it",
        404
      );
    }

    if (existingReview.user_id !== req.user!.id) {
      throw HttpError(
        "Review not found or you do not have permission to edit it",
        404
      );
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

    // Update review
    const { data: review, error } = await userSupabase
      .from("reviews")
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw HttpError("Failed to update review", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
      message: "Review updated successfully",
    };

    res.json(response);
  }
);
