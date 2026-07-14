/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn() } },
}));
jest.mock("bcrypt", () => ({ compare: jest.fn() }));
jest.mock("@/lib/auth", () => ({ signToken: jest.fn().mockResolvedValue("signed.jwt.token") }));

const cookieSet = jest.fn();
jest.mock("next/headers", () => ({
  cookies: () => ({ set: cookieSet, get: jest.fn(), delete: jest.fn() }),
}));

import { POST } from "@/app/api/auth/login/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { resetRateLimit } from "@/lib/rateLimit";

const makeReq = (body: unknown) => ({ json: async () => body }) as Request;

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimit();
  });

  it("retourne 400 si l'email est invalide (validation Zod)", async () => {
    const res = await POST(makeReq({ email: "not-an-email", password: "secret" }));
    expect(res.status).toBe(400);
  });

  it("retourne 401 si l'utilisateur n'existe pas", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeReq({ email: "a@b.fr", password: "secret" }));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Invalid credentials" });
  });

  it("retourne 401 si le mot de passe est incorrect", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "u1", email: "a@b.fr", passwordHash: "hash", name: "Alice",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const res = await POST(makeReq({ email: "a@b.fr", password: "wrong" }));
    expect(res.status).toBe(401);
  });

  it("retourne 200, l'utilisateur et pose le cookie httpOnly si succès", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "u1", email: "a@b.fr", passwordHash: "hash", name: "Alice",
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const res = await POST(makeReq({ email: "a@b.fr", password: "secret" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user).toEqual({ id: "u1", email: "a@b.fr", name: "Alice" });
    expect(cookieSet).toHaveBeenCalledWith(
      expect.objectContaining({ name: "token", httpOnly: true, path: "/" })
    );
  });

  it("retourne 500 en cas d'erreur interne", async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await POST(makeReq({ email: "a@b.fr", password: "secret" }));
    expect(res.status).toBe(500);
  });

  it("retourne 429 au-delà du seuil de tentatives (OWASP A07)", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = () => makeReq({ email: "a@b.fr", password: "secret" });
    // 5 tentatives autorisées, la 6e est limitée
    for (let i = 0; i < 5; i++) {
      expect((await POST(req())).status).toBe(401);
    }
    const limited = await POST(req());
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).not.toBeNull();
  });
});
