import axios from "axios";
import { MovieApiResponse, Movie, Rating } from "../types";
import { HttpError } from "@/middleware";
import { config } from "../config";

async function makeOMDBRequest(params: Record<string, string>) {
  try {
    const response = await axios.get(config.externalApis.omdb.baseUrl, {
      params: {
        apikey: config.externalApis.omdb.apiKey,
        ...params,
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.data.Response === "False") {
      throw HttpError(response.data.Error || "Movie not found", 404);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw HttpError("Invalid OMDB API key", 500);
      }
      if (error.code === "ECONNABORTED") {
        throw HttpError("OMDB API request timeout", 504);
      }
      throw HttpError("Failed to fetch data from OMDB API", 500);
    }
    throw error;
  }
}

export async function searchMovies(
  query: string,
  year?: string,
  type?: string
) {
  const params: Record<string, string> = {
    s: query,
  };

  if (year) params.y = year;
  if (type) params.type = type;

  const data = await makeOMDBRequest(params);

  if (!data.Search) {
    return [];
  }

  // Fetch full movie details for each result to get ratings
  const moviesWithDetails = await Promise.all(
    data.Search.slice(0, 10).map(async (movie: any) => {
      try {
        // Get full movie details using IMDb ID
        const fullDetails = await getMovieByImdbId(movie.imdbID);

        // Transform to include ratings and full details
        const ratings: Rating[] = fullDetails.Ratings
          ? fullDetails.Ratings.map((rating: any) => ({
              source: rating.Source,
              value: rating.Value,
            }))
          : [];

        return {
          imdb_id: movie.imdbID,
          title: fullDetails.Title || movie.Title,
          year: movie.Year,
          type: movie.Type,
          poster: movie.Poster !== "N/A" ? movie.Poster : null,
          director: fullDetails.Director || "",
          release_date: fullDetails.Released || "",
          genre: fullDetails.Genre || "",
          runtime: fullDetails.Runtime || "",
          description: fullDetails.Plot || "",
          ratings: ratings,
        };
      } catch (error) {
        return {
          imdb_id: movie.imdbID,
          title: movie.Title,
          year: movie.Year,
          type: movie.Type,
          poster: movie.Poster !== "N/A" ? movie.Poster : null,
          director: "",
          release_date: "",
          genre: "",
          runtime: "",
          description: "",
          ratings: [],
        };
      }
    })
  );

  return moviesWithDetails;
}

export async function getMovieByImdbId(
  imdbId: string
): Promise<MovieApiResponse> {
  return await makeOMDBRequest({ i: imdbId });
}

export async function getMovieByTitle(
  title: string,
  year?: string
): Promise<MovieApiResponse> {
  const params: Record<string, string> = {
    t: title,
  };

  if (year) params.y = year;

  return await makeOMDBRequest(params);
}

export function convertToMovieSchema(
  omdbData: MovieApiResponse,
  userId?: string
): any {
  // Transform ratings from OMDB format to our format
  const ratings: Rating[] = omdbData.Ratings
    ? omdbData.Ratings.map((rating: any) => ({
        source: rating.Source,
        value: rating.Value,
      }))
    : [];

  return {
    title: omdbData.Title || "",
    director: omdbData.Director || "",
    release_date: omdbData.Released || "",
    genre: omdbData.Genre || "",
    runtime: omdbData.Runtime || "",
    description: omdbData.Plot || "",
    ratings: ratings,
    youtube_trailer_url: "", // Will be populated by YouTube service
    poster_url: omdbData.Poster !== "N/A" ? omdbData.Poster : null,
    imdb_id: omdbData.imdbID || "",
    user_id: userId || null,
  };
}
