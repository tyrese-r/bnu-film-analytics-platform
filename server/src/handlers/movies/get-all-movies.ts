import { Request, Response } from "express";
import { supabase } from "@/lib/supabase";
import { asyncHandler, HttpError } from "@/middleware";
import { searchTrailer } from "@/services/youtubeService";
import { ApiResponse, Movie } from "@/types";

export const getAllMovies = asyncHandler(
  async (req: Request, res: Response) => {
    let query = supabase
      .from("movies")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: movies, error } = await query;

    if (error) {
      throw HttpError("Failed to fetch movies", 500);
    }

    const moviesWithTrailers = await Promise.all(
      (movies || []).map(async (movie: any) => {
        if (!movie.youtube_trailer_url) {
          try {
            const trailerUrl = await searchTrailer(
              movie.title,
              movie.release_date
            );
            if (trailerUrl) {
              await supabase
                .from("movies")
                .update({ youtube_trailer_url: trailerUrl })
                .eq("id", movie.id);
              movie.youtube_trailer_url = trailerUrl;
            }
          } catch (error) {}
        }
        return movie;
      })
    );

    const response: ApiResponse<Movie[]> = {
      success: true,
      data: moviesWithTrailers,
    };

    res.json(response);
  }
);
