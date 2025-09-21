import { Response } from "express";
import { AuthenticatedRequest, asyncHandler } from "@/middleware";
import { ApiResponse, User } from "@/types";

export const getCurrentUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const response: ApiResponse<User> = {
      success: true,
      data: req.user!,
    };

    res.json(response);
  }
);
