import { makeOMDBRequest } from "./make-omdb-request";

export async function searchMovies(
  query: string,
  year?: string,
  type?: string
) {
  const params: Record<string, string> = { s: query };
  if (year) params.y = year;
  if (type) params.type = type;

  const data = await makeOMDBRequest(params);
  return data.Search ? data.Search.slice(0, 10) : [];
}
