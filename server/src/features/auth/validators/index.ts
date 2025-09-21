import { HttpError } from "../../../middleware/error-handler";

export function validateCreateUser(body: any) {
  if (!body.email || !body.password) {
    throw HttpError("Email and password are required", 400);
  }
  if (!body.email.includes("@")) {
    throw HttpError("Invalid email format", 400);
  }
  if (body.password.length < 6) {
    throw HttpError("Password must be at least 6 characters", 400);
  }
  return body;
}

export function validateLogin(body: any) {
  if (!body.email || !body.password) {
    throw HttpError("Email and password are required", 400);
  }
  if (!body.email.includes("@")) {
    throw HttpError("Invalid email format", 400);
  }
  return body;
}
