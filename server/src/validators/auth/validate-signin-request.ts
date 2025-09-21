import { HttpError } from "@/middleware";

const signinRules = [
  {
    validate: (body: any) => !!body.email && !!body.password,
    message: "Both email and password are required",
    status: 400,
  },
  {
    validate: (body: any) => typeof body.email === "string" && body.email.includes("@"),
    message: "Email format is invalid",
    status: 400,
  },
];

export function validateSigninRequest(body: any) {
  const failedRule = signinRules.find(rule => !rule.validate(body));
  if (failedRule) {
    throw HttpError(failedRule.message, failedRule.status);
  }
  return body;
}
