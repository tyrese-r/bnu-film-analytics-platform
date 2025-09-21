import { HttpError } from "@/middleware";

const createMovieRules = [
  {
    validate: (body: any) => !!(body.title || body.imdb_id),
    message: "Either title or imdb_id is required",
    status: 400,
  },
];

export function validateCreateMovie(body: any) {
  const failedRule = createMovieRules.find(rule => !rule.validate(body));
  if (failedRule) {
    throw HttpError(failedRule.message, failedRule.status);
  }
  return body;
}
