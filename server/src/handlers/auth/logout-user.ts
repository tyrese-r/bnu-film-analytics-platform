import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { ApiResponse } from "@/types";

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw HttpError("Failed logout attempt", 500);
  }

  const response: ApiResponse = {
    success: true,
    message: "Logout successful",
  };

  res.json(response);
});
