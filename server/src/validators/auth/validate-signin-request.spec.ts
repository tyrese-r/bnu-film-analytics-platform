import { describe, it, expect } from "vitest";
import { validateSigninRequest } from "./validate-signin-request";
import { HttpError } from "@/middleware/error-handler";

describe("validateSigninRequest", () => {
  it("should pass with valid email and password", () => {
    const body = { email: "test@example.com", password: "password123" };
    expect(() => validateSigninRequest(body)).not.toThrow();
  });

  it("should throw when email is missing", () => {
    const body = { password: "password123" };
    expect(() => validateSigninRequest(body)).toThrow();
  });

  it("should throw when password is missing", () => {
    const body = { email: "test@example.com" };
    expect(() => validateSigninRequest(body)).toThrow();
  });

  it("should throw when email format is invalid", () => {
    const body = { email: "invalid-email", password: "password123" };
    expect(() => validateSigninRequest(body)).toThrow();
  });
});
