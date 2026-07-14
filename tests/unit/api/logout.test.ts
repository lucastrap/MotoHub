/**
 * @jest-environment node
 */
const cookieDelete = jest.fn();
jest.mock("next/headers", () => ({
  cookies: () => ({ delete: cookieDelete }),
}));

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  beforeEach(() => jest.clearAllMocks());

  it("supprime le cookie token et retourne 200", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    expect(cookieDelete).toHaveBeenCalledWith("token");
    expect(await res.json()).toEqual({ success: true });
  });
});
