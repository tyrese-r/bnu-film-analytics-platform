import { Response } from "express";
import { AuthenticatedRequest, asyncHandler, HttpError } from "@/middleware";
import { supabase, createUserClient } from "@/lib/supabase";

export const deleteSavedMovie = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);
    const userSupabase = createUserClient(token!);

    const { data, error } = await userSupabase
      .from("saved_movies")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      throw HttpError("Failed to delete saved movie", 500);
    }

    if (!data || data.length === 0) {
      throw HttpError(
        "Saved movie not found or you do not have permission to delete it",
        404
      );
    }

    const response = {
      success: true,
      message: "Saved movie deleted successfully",
    };

    res.json(response);
  }
);
