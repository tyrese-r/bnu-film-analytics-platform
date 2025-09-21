import { ApiError } from "../../../middleware/error-handler";

// Review validation functions
export function validateCreateReview(body: any) {
  if (!body.movie_id || !body.rating || !body.title || !body.comment) {
    throw ApiError("movie_id, rating, title, and comment are required", 400);
  }
  if (body.rating < 1 || body.rating > 10) {
    throw ApiError("Rating must be between 1 and 10", 400);
  }
  if (body.title.length > 200) {
    throw ApiError("Title must be less than 200 characters", 400);
  }
  if (body.comment.length > 2000) {
    throw ApiError("Comment must be less than 2000 characters", 400);
  }
  return body;
}

export function validateUpdateReview(body: any) {
  if (!body.rating && !body.title && !body.comment) {
    throw ApiError("At least one field must be provided", 400);
  }
  if (body.rating && (body.rating < 1 || body.rating > 10)) {
    throw ApiError("Rating must be between 1 and 10", 400);
  }
  if (body.title && body.title.length > 200) {
    throw ApiError("Title must be less than 200 characters", 400);
  }
  if (body.comment && body.comment.length > 2000) {
    throw ApiError("Comment must be less than 2000 characters", 400);
  }
  return body;
}
