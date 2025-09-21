import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { ApiResponse, CreateUserRequest, User } from "@/types";
import { validateSignupRequest } from "@/validators/auth";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: CreateUserRequest = validateSignupRequest(
    req.body
  );

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw HttpError(authError.message, 400);
  }

  if (!authData.user) {
    throw HttpError("Unable to create user", 500);
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
    message: `User: ${user.email} has been created successfully`,
  };

  res.status(201).json(response);
});
