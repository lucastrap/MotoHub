/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { user: { findUnique: jest.fn(), create: jest.fn() } },
}));
jest.mock("bcrypt", () => ({ hash: jest.fn().mockResolvedValue("hashed-password") }));

import { POST } from "@/app/api/auth/register/route";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { resetRateLimit } from "@/lib/rateLimit";

const makeReq = (body: unknown) => ({ json: async () => body }) as Request;

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimit();
  });

  it("retourne 400 si le mot de passe est trop court (< 6)", async () => {
    const res = await POST(makeReq({ email: "a@b.fr", password: "123" }));
    expect(res.status).toBe(400);
  });

  it("retourne 400 si l'email est invalide", async () => {
    const res = await POST(makeReq({ email: "invalid", password: "secret" }));
    expect(res.status).toBe(400);
  });

  it("retourne 400 si l'utilisateur existe déjà", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "u1" });
    const res = await POST(makeReq({ email: "a@b.fr", password: "secret" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "User already exists" });
  });

  it("retourne 201 et hache le mot de passe avec bcrypt si succès", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "u1", email: "a@b.fr", name: "Alice",
    });
    const res = await POST(makeReq({ email: "a@b.fr", password: "secret", name: "Alice" }));
    expect(res.status).toBe(201);
    expect(bcrypt.hash).toHaveBeenCalledWith("secret", 10);
    const json = await res.json();
    expect(json).toEqual({ id: "u1", email: "a@b.fr", name: "Alice" });
  });

  it("retourne 500 en cas d'erreur interne", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await POST(makeReq({ email: "a@b.fr", password: "secret" }));
    expect(res.status).toBe(500);
  });
});
