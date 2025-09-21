import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "./error-handler";
import { HttpError } from "./http-error";

describe("errorHandler", () => {
  it("should handle HttpError with status code", () => {
    const error = HttpError("http error", 400);
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "http error",
    });
  });

  it("should always default to a 500 status code", () => {
    const error = new Error("Any error");
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Any error",
    });
  });
});
