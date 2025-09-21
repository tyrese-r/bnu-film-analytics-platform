import { Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";
import { supabase } from "@/lib/supabase";

export const deleteReview = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Check if review exists and user owns it
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

    // Delete review
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
