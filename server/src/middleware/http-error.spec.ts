import { describe, it, expect } from "vitest";
import { HttpError } from "./http-error";

describe("HttpError", () => {
  it("should create error with message and status code", () => {
    const error = HttpError("Hello error", 400);

    expect(error.message).toBe("Hello error");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("HTTP ERROR");
  });

  it("should set default status code to 500", () => {
    const error = HttpError("Hello error");

    expect(error.message).toBe("Hello error");
    expect(error.statusCode).toBe(500);
  });
});
