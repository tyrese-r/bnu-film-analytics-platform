import { describe, it, expect, vi } from "vitest";
import { asyncHandler } from "./async-handler";

describe("asyncHandler", () => {
  it("should handle async function successfully", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const handler = asyncHandler(mockFn);
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    await handler(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });
});
