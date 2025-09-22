export const config = {
  server: {
    port: process.env.PORT || 3000,
  },
  externalApis: {
    omdb: {
      baseUrl: "http://www.omdbapi.com/",
      get apiKey() {
        return process.env.OMDB_API_KEY;
      },
    },
    youtube: {
      baseUrl: "https://www.googleapis.com/youtube/v3",
      watchBaseUrl: "https://www.youtube.com/watch?v=",
      get apiKey() {
        return process.env.YOUTUBE_API_KEY;
      },
      fallbackUrl:
        "https://www.youtube.com/watch?v=4bMOTTJqGgM&list=RD4bMOTTJqGgM&start_radio=1",
    },
  },
} as const;
