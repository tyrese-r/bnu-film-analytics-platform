import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { authenticateUser, AuthenticatedRequest } from "@/middleware/auth";
import { asyncHandler, HttpError } from "@/middleware/error-handler";
import { ApiResponse, CreateUserRequest, LoginRequest, User } from "@/types";
import { validateCreateUser, validateLogin } from "@/validators/auth";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: CreateUserRequest = validateCreateUser(req.body);

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    throw HttpError(authError.message, 400);
  }

  if (!authData.user) {
    throw HttpError("Failed to create user", 500);
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
    message: "User created successfully",
  };

  res.status(201).json(response);
});

// POST /users/login - Login user
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginRequest = validateLogin(req.body);

  // Authenticate user with Supabase
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (authError) {
    throw HttpError("Invalid credentials", 401);
  }

  if (!authData.user || !authData.session) {
    throw HttpError("Login failed", 500);
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

// GET /users/me - Get current user
export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const response: ApiResponse<User> = {
      success: true,
      data: req.user!,
    };

    res.json(response);
  }
);

// POST /users/logout - Logout user
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw HttpError("Logout failed", 500);
  }

  const response: ApiResponse = {
    success: true,
    message: "Logout successful",
  };

  res.json(response);
});
