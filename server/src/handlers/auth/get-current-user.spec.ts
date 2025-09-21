import { describe, it, expect, vi } from "vitest";
import { getCurrentUser } from "./get-current-user";

describe("getCurrentUser", () => {
  it("should successfully return current user", async () => {
    const userData = {
      id: "id12345",
      email: "hello@mail.com",
      created_at: "2025-09-22",
      updated_at: "2025-09-22",
    };

    const mockReq = { user: userData } as any;
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const mockNext = vi.fn();

    await getCurrentUser(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: {
        id: "id12345",
        email: "hello@mail.com",
        created_at: "2025-09-22",
        updated_at: "2025-09-22",
      },
    });
  });
});
