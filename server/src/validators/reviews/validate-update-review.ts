import { HttpError } from "@/middleware/error-handler";

const updateReviewRules = [
  {
    validate: (body: any) => !!(body.rating || body.title || body.comment),
    message: "Please provide a rating, title, or comment to update",
    status: 400,
  },
  {
    validate: (body: any) =>
      !body.rating ||
      (typeof body.rating === "number" &&
        body.rating >= 1 &&
        body.rating <= 10),
    message: "Please provide a valid rating between 1 and 10",
    status: 400,
  },
  {
    validate: (body: any) =>
      !body.title ||
      (typeof body.title === "string" && body.title.length <= 20),
    message: "Review title must be less than 20 characters",
    status: 400,
  },
  {
    validate: (body: any) =>
      !body.comment ||
      (typeof body.comment === "string" && body.comment.length <= 300),
    message: "Comment must be less than 300 characters",
    status: 400,
  },
];

export function validateUpdateReview(body: any) {
  const failedRule = updateReviewRules.find((rule) => !rule.validate(body));
  if (failedRule) {
    throw HttpError(failedRule.message, failedRule.status);
  }
  return body;
}
