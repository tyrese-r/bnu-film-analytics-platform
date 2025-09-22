import { config } from "@/config";

export async function searchTrailer(
  movieTitle: string,
  year?: string
): Promise<string | null> {
  if (!config.externalApis.youtube.apiKey) {
    return null;
  }

  try {
    const searchQuery = `${movieTitle} ${year || ""} trailer`.trim();

    const url = new URL(`${config.externalApis.youtube.baseUrl}/search`);
    url.searchParams.append("key", config.externalApis.youtube.apiKey!);
    url.searchParams.append("part", "snippet");
    url.searchParams.append("q", searchQuery);
    url.searchParams.append("maxResults", "1");

    const response = await fetch(url.toString(), {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const videos = data.items || [];

    if (videos.length > 0) {
      return `${config.externalApis.youtube.watchBaseUrl}${videos[0].id.videoId}`;
    }

    return config.externalApis.youtube.fallbackUrl;
  } catch (error) {
    return null;
  }
}
