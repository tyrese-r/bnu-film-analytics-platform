import { describe, it, expect } from "vitest";
import { validateSignupRequest } from "./validate-signup-request";
import { HttpError } from "@/middleware/error-handler";

describe("validateSignupRequest", () => {
  it("should pass with valid email and password", () => {
    const body = { email: "test@example.com", password: "password123" };
    expect(() => validateSignupRequest(body)).not.toThrow();
  });

  it("should throw when email is missing", () => {
    const body = { password: "password123" };
    expect(() => validateSignupRequest(body)).toThrow();
  });

  it("should throw when password is missing", () => {
    const body = { email: "test@example.com" };
    expect(() => validateSignupRequest(body)).toThrow();
  });

  it("should throw when email format is invalid", () => {
    const body = { email: "invalid-email", password: "password123" };
    expect(() => validateSignupRequest(body)).toThrow();
  });

  it("should throw when password is too short", () => {
    const body = { email: "test@example.com", password: "12345" };
    expect(() => validateSignupRequest(body)).toThrow();
  });
});
