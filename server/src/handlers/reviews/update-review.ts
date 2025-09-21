import { Response } from "express";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, UpdateReviewRequest } from "@/types";
import { validateUpdateReview } from "@/validators/reviews";
import { supabase, createUserClient } from "@/lib/supabase";

export const updateReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const body: UpdateReviewRequest = validateUpdateReview(req.body);

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const userSupabase = createUserClient(token!);

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

    const { data: review, error } = await userSupabase
      .from("reviews")
      .update(body)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw HttpError("Update review failed", 500);
    }

    const response: ApiResponse<any> = {
      success: true,
      data: review,
      message: "Review updated successfully",
    };

    res.json(response);
  }
);
