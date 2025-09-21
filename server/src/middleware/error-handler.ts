import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";
import { CustomError } from "./http-error";

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message;

  const response: ApiResponse = {
    success: false,
    message,
  };

  res.status(statusCode).json(response);
};
