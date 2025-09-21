import { Response } from "express";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";
import { supabase, createUserClient } from "@/lib/supabase";

export const deleteReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

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
        "Review not found or you do not have permission to delete it",
        404
      );
    }

    if (existingReview.user_id !== req.user!.id) {
      throw HttpError(
        "Review not found or you do not have permission to delete it",
        404
      );
    }

    const { error } = await userSupabase.from("reviews").delete().eq("id", id);

    if (error) {
      throw HttpError("Failed to delete review", 500);
    }

    const response: ApiResponse = {
      success: true,
      message: "Review deleted successfully",
    };

    res.json(response);
  }
);
