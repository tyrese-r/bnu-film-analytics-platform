import { ApiError } from "../../../middleware/error-handler";

export function validateCreateMovie(body: any) {
  if (!body.title && !body.imdb_id) {
    throw ApiError("Either title or imdb_id is required", 400);
  }
  return body;
}

export function validateSearchMovies(query: any) {
  if (!query.query) {
    throw ApiError("Query parameter is required", 400);
  }
  return query;
}
