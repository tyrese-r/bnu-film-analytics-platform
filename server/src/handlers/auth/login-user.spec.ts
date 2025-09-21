import { describe, it, expect, vi } from "vitest";
import { loginUser } from "./login-user";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
    },
  },
}));

vi.mock("@/validators/auth", () => ({
  validateSigninRequest: vi.fn((data) => data),
}));

describe("loginUser", () => {
  it("should successfully login user", async () => {
    const userData = {
      id: "id12345",
      email: "hello@mail.com",
      created_at: "2025-09-22",
      updated_at: "2025-09-22",
    };

    const mockReq = {
      body: { email: "hello@mail.com", password: "password123" },
    } as any;
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const mockNext = vi.fn();

    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: {
        user: userData,
        session: {
          access_token: "this_is_the_long_access_token_they_give_you",
        },
      },
      error: null,
    });

    await loginUser(mockReq, mockRes, mockNext);

    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: {
        user: {
          id: "id12345",
          email: "hello@mail.com",
          created_at: "2025-09-22",
          updated_at: "2025-09-22",
        },
        session: {
          access_token: "this_is_the_long_access_token_they_give_you",
        },
      },
      message: "Login successful",
    });
  });
});
