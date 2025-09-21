import { NextFunction, Request, Response } from "express";
import { supabase } from "../../config/supabase";
import { HttpError } from "../error-handler";
import { User } from "../../types";

export interface AuthenticatedRequest extends Request {
  user?: User;
  headers: any;
  body: any;
  query: any;
  params: any;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw HttpError("No token provided", 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw HttpError("Invalid token", 401);
    }

    // Use auth user directly (no custom users table needed)
    req.user = {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at,
    };
    next();
  } catch (error) {
    next(error);
  }
};
