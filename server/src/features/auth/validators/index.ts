import { ApiError } from "../../../middleware/error-handler";

export function validateCreateUser(body: any) {
  if (!body.email || !body.password) {
    throw ApiError("Email and password are required", 400);
  }
  if (!body.email.includes("@")) {
    throw ApiError("Invalid email format", 400);
  }
  if (body.password.length < 6) {
    throw ApiError("Password must be at least 6 characters", 400);
  }
  return body;
}

export function validateLogin(body: any) {
  if (!body.email || !body.password) {
    throw ApiError("Email and password are required", 400);
  }
  if (!body.email.includes("@")) {
    throw ApiError("Invalid email format", 400);
  }
  return body;
}
