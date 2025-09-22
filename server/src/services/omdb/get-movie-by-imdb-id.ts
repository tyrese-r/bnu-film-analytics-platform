import { OMDBResponse } from "@/types";
import { makeOMDBRequest } from "./make-omdb-request";

export async function getMovieByImdbId(
  imdbId: string
): Promise<OMDBResponse> {
  return await makeOMDBRequest({ i: imdbId });
}
