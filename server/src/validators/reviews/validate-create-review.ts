import { HttpError } from "@/middleware";

const createReviewRules = [
  {
    validate: (body: any) => !!(body.movie_id && body.rating && body.title && body.comment),
    message: "movie_id, rating, title, and comment are required",
    status: 400,
  },
  {
    validate: (body: any) => typeof body.rating === "number" && body.rating >= 1 && body.rating <= 10,
    message: "Rating must be between 1 and 10",
    status: 400,
  },
  {
    validate: (body: any) => typeof body.title === "string" && body.title.length <= 200,
    message: "Title must be less than 200 characters",
    status: 400,
  },
  {
    validate: (body: any) => typeof body.comment === "string" && body.comment.length <= 2000,
    message: "Comment must be less than 2000 characters",
    status: 400,
  },
];

export function validateCreateReview(body: any) {
  const failedRule = createReviewRules.find(rule => !rule.validate(body));
  if (failedRule) {
    throw HttpError(failedRule.message, failedRule.status);
  }
  return body;
}
