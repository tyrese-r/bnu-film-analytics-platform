import { HttpError } from "@/middleware";

const searchMoviesRules = [
  {
    validate: (query: any) => !!query.query,
    message: "Query parameter is required",
    status: 400,
  },
];

export function validateSearchMovies(query: any) {
  const failedRule = searchMoviesRules.find(rule => !rule.validate(query));
  if (failedRule) {
    throw HttpError(failedRule.message, failedRule.status);
  }
  return query;
}
