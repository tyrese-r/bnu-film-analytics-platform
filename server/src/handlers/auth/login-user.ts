import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, LoginRequest, User } from "@/types";
import { validateSigninRequest } from "@/validators/auth";

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = validateSigninRequest(req.body);

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    throw HttpError("Invalid credentials", 401);
  }

  if (!authData.user || !authData.session) {
    throw HttpError("Failed login attempt", 500);
  }

  const user: User = {
    id: authData.user.id,
    email: authData.user.email!,
    created_at: authData.user.created_at,
    updated_at: authData.user.updated_at || authData.user.created_at,
  };

  const response: ApiResponse<{ user: User; session: any }> = {
    success: true,
    data: {
      user,
      session: authData.session,
    },
    message: "Login successful",
  };

  res.json(response);
});
