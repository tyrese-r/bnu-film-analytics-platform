import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { searchTrailer } from "@/services/youtubeService";
import { ApiResponse, Movie } from "@/types";

export const getMovieById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const { data: movie, error } = await supabase
      .from("movies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !movie) {
      throw HttpError("Movie not found", 404);
    }

    // Fetch trailer if it doesn't exist
    if (!movie.youtube_trailer_url) {
      try {
        const trailerUrl = await searchTrailer(movie.title, movie.release_date);
        if (trailerUrl) {
          // Update the movie in database with trailer URL
          await supabase
            .from("movies")
            .update({ youtube_trailer_url: trailerUrl })
            .eq("id", movie.id);
          movie.youtube_trailer_url = trailerUrl;
        }
      } catch (error) {
        console.error(`Failed to fetch trailer for ${movie.title}:`, error);
      }
    }

    const response: ApiResponse<Movie> = {
      success: true,
      data: movie,
    };

    res.json(response);
  }
);
