import { OMDBResponse } from "@/types";
import { makeOMDBRequest } from "./make-omdb-request";

export async function getMovieByTitle(
  title: string,
  year?: string
): Promise<OMDBResponse> {
  const params: Record<string, string> = { t: title };
  if (year) params.y = year;

  return await makeOMDBRequest(params);
}
