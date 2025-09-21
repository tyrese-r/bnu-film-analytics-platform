import axios from "axios";
import { config } from "../config";

export async function searchTrailer(
  movieTitle: string,
  year?: string
): Promise<string | null> {
  // Check if YouTube API key is available
  if (!config.externalApis.youtube.apiKey) {
    console.warn("YouTube API key not found - trailer search disabled");
    return null;
  }

  try {
    const searchQuery = `${movieTitle} ${year || ""} trailer`.trim();

    const response = await axios.get(
      `${config.externalApis.youtube.baseUrl}/search`,
      {
        params: {
          key: config.externalApis.youtube.apiKey,
          part: "snippet",
          q: searchQuery,
          maxResults: 1,
        },
        timeout: 5000,
      }
    );

    const videos = response.data.items || [];
    if (videos.length > 0) {
      return `https://www.youtube.com/watch?v=${videos[0].id.videoId}`;
    }

    return null;
  } catch (error) {
    return null;
  }
}
