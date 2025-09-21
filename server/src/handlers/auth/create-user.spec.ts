import { describe, it, expect, vi } from "vitest";
import { createUser } from "./create-user";
import { supabase } from "@/lib/supabase";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
    },
  },
}));

vi.mock("@/validators/auth", () => ({
  validateSignupRequest: vi.fn((data) => data),
}));

describe("createUser", () => {
  it("should successfully create a user", async () => {
    const userData = {
      id: "id12345",
      email: "hello@mail.com",
      created_at: "2025-09-22",
      updated_at: "2025-09-22",
    };

    const mockReq = { body: { email: "test@example.com", password: "password123" } } as any;
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const mockNext = vi.fn();

    (supabase.auth.signUp as any).mockResolvedValue({
      data: {
        user: userData,
        session: {
          access_token: "this_is_the_long_access_token_they_give_you",
        },
      },
      error: null,
    });

    await createUser(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(201);
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
      message: "User: hello@mail.com has been created successfully",
    });
  });
});
