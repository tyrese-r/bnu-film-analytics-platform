import { describe, it, expect, vi } from "vitest";
import { logoutUser } from "./logout-user";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe("logoutUser", () => {
  it("should successfully logout user", async () => {
    const mockReq = {} as any;
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const mockNext = vi.fn();

    (supabase.auth.signOut as any).mockResolvedValue({ error: null });

    await logoutUser(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Logout successful",
    });
  });
});
