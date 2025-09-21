export const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  externalApis: {
    omdb: {
      baseUrl: "http://www.omdbapi.com/",
      apiKey: () => process.env.OMDB_API_KEY,
    },
    youtube: {
      baseUrl: "https://www.googleapis.com/youtube/v3",
      apiKey: () => process.env.YOUTUBE_API_KEY,
    },
  },
} as const;
