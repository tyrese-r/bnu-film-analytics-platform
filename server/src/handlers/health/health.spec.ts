import { describe, it, expect, vi } from "vitest";
import { health } from "./health";

describe("health", () => {
  it("should successfully return health status", async () => {
    const mockReq = {} as any;
    const mockRes = { json: vi.fn() } as any;

    health(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      status: "OK",
    });
  });
});
