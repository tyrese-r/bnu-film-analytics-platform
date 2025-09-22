import { HttpError } from "@/middleware";
import { config } from "@/config";

export async function makeOMDBRequest(params: Record<string, string>) {
  const url = new URL(config.externalApis.omdb.baseUrl);
  url.searchParams.append("apikey", config.externalApis.omdb.apiKey!);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    signal: AbortSignal.timeout(10000),
  });

  const data = await response.json();

  if (data.Response === "False") {
    throw HttpError(data.Error || "Movie not found", 404);
  }

  return data;
}
