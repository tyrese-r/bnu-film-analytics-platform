import { describe, it, expect } from "vitest";
import { validateSigninRequest } from "./validate-signin-request";

describe("validateSigninRequest", () => {
  it("should pass with valid email and password", () => {
    const body = { email: "leemurray@mail.com", password: "leemurray12" };
    expect(() => validateSigninRequest(body)).not.toThrow();
  });

  it("should throw when email is missing", () => {
    const body = { password: "leemurray12" };
    expect(() => validateSigninRequest(body)).toThrow();
  });

  it("should throw when password is missing", () => {
    const body = { email: "lemurray@mail.com" };
    expect(() => validateSigninRequest(body)).toThrow();
  });

  it("should throw when email format is invalid", () => {
    const body = { email: "leemurray", password: "leemurray12" };
    expect(() => validateSigninRequest(body)).toThrow();
  });
});
