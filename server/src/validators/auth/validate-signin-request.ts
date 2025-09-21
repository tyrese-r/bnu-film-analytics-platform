import { HttpError } from "@/middleware/error-handler";

export function validateSigninRequest(body: any) {
  if (!body.email || !body.password) {
    throw HttpError("Email and password are required", 400);
  }
  if (!body.email.includes("@")) {
    throw HttpError("Invalid email format", 400);
  }
  return body;
}
