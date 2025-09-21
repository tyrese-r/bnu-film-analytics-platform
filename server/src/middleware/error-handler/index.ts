import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../types";

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const ApiError = (
  message: string,
  statusCode: number = 500,
  code?: string
) => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  error.code = code;
  error.name = "ApiError";
  return error;
};
