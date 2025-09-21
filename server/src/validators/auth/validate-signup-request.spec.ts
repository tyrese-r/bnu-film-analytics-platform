import { describe, it, expect } from "vitest";
import { validateSignupRequest } from "./validate-signup-request";
import { HttpError } from "@/middleware";

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
    const body = { email: "hellomail@example.com" };
    expect(() => validateSignupRequest(body)).toThrow();
  });

  it("should throw when email is invalid email format", () => {
    const body = { email: "hellomail", password: "hello123" };
    expect(() => validateSignupRequest(body)).toThrow();
  });

  it("should throw when password is lees than minimum required length", () => {
    const body = { email: "hello@mail.com", password: "123" };
    expect(() => validateSignupRequest(body)).toThrow();
  });
});
