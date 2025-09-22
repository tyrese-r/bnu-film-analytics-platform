import { OMDBResponse, Rating } from "@/types";

export function convertToMovieSchema(
  omdbData: OMDBResponse,
  userId?: string
): any {
  const ratings: Rating[] = omdbData.Ratings?.map((rating: any) => ({
    source: rating.Source,
    value: rating.Value,
  })) || [];

  return {
    title: omdbData.Title || "",
    director: omdbData.Director || "",
    release_date: omdbData.Released || "",
    genre: omdbData.Genre || "",
    runtime: omdbData.Runtime || "",
    description: omdbData.Plot || "",
    ratings,
    youtube_trailer_url: "",
    poster_url: omdbData.Poster !== "N/A" ? omdbData.Poster : null,
    imdb_id: omdbData.imdbID || "",
    user_id: userId || null,
  };
}
