import { HttpError } from "@/middleware";

const signupRules = [
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
  {
    validate: (body: any) => typeof body.password === "string" && body.password.length >= 6,
    message: "Password must be a minimum of 6 characters",
    status: 400,
  },
];

export function validateSignupRequest(body: any) {
  const failedRule = signupRules.find(rule => !rule.validate(body));
  if (failedRule) {
    throw HttpError(failedRule.message, failedRule.status);
  }
  return body;
}
