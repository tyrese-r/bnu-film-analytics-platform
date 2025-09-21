import { Request, Response } from "express";
import { asyncHandler } from "@/middleware";
import { searchMovies } from "@/services/omdbService";
import { ApiResponse } from "@/types";
import { validateSearchMovies } from "@/validators/movies";

export const searchOMDBMovies = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateSearchMovies(req.query);
    const { query: searchQuery } = query;

    const movies = await searchMovies(searchQuery);

    const response: ApiResponse<any[]> = {
      success: true,
      data: movies,
      message: "Search completed successfully",
    };

    res.json(response);
  }
);
