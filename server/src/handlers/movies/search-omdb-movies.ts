import { Request, Response } from "express";
import { asyncHandler } from "@/middleware";
import { searchMovies, getMovieByImdbId } from "@/services/omdb";
import { ApiResponse, Rating } from "@/types";
import { validateSearchMovies } from "@/validators/movies";

export const searchOMDBMovies = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateSearchMovies(req.query);
    const { query: searchQuery } = query;

    const searchResults = await searchMovies(searchQuery);

    const moviesWithDetails = await Promise.all(
      searchResults.slice(0, 10).map(async (movie: any) => {
        try {
          const fullDetails = await getMovieByImdbId(movie.imdbID);

          const ratings: Rating[] =
            fullDetails.Ratings?.map((rating: any) => ({
              source: rating.Source,
              value: rating.Value,
            })) || [];

          return {
            imdb_id: movie.imdbID,
            title: fullDetails.Title || movie.Title,
            year: movie.Year,
            type: movie.Type,
            poster: movie.Poster,
            director: fullDetails.Director,
            release_date: fullDetails.Released,
            genre: fullDetails.Genre,
            runtime: fullDetails.Runtime,
            description: fullDetails.Plot,
            ratings: ratings,
          };
        } catch (error) {
          return {
            imdb_id: movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            type: movie.Type,
            poster: movie.Poster,
            director: null,
            release_date: null,
            genre: null,
            runtime: null,
            description: null,
            ratings: [],
          };
        }
      })
    );

    const response: ApiResponse<any[]> = {
      success: true,
      data: moviesWithDetails,
      message: "Search completed successfully",
    };

    res.json(response);
  }
);
