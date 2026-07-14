/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    motorcycle: { findFirst: jest.fn(), updateMany: jest.fn(), update: jest.fn() },
  },
}));
const cookieGet = jest.fn();
jest.mock("next/headers", () => ({ cookies: () => ({ get: cookieGet }) }));
jest.mock("@/lib/auth", () => ({ verifyAuth: jest.fn() }));

import { PATCH } from "@/app/api/motorcycles/[id]/route";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

const makeReq = (body: unknown) => ({ json: async () => body }) as Request;
const ctx = (id: string) => ({ params: { id } });
const authAs = (sub: string) => {
  cookieGet.mockReturnValue({ value: "tok" });
  (verifyAuth as jest.Mock).mockResolvedValue({ sub });
};

describe("PATCH /api/motorcycles/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 401 sans authentification", async () => {
    cookieGet.mockReturnValue(undefined);
    const res = await PATCH(makeReq({ isPrimary: true }), ctx("m1"));
    expect(res.status).toBe(401);
  });

  it("retourne 404 si la moto n'appartient pas à l'utilisateur", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await PATCH(makeReq({ isPrimary: true }), ctx("m1"));
    expect(res.status).toBe(404);
  });

  it("définit la moto comme principale et retire le flag des autres", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue({ id: "m1", userId: "u1" });
    (prisma.motorcycle.update as jest.Mock).mockResolvedValue({ id: "m1", isPrimary: true });
    const res = await PATCH(makeReq({ isPrimary: true }), ctx("m1"));
    expect(res.status).toBe(200);
    expect(prisma.motorcycle.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u1" }, data: { isPrimary: false } })
    );
    expect(prisma.motorcycle.update).toHaveBeenCalled();
  });

  it("met à jour sans toucher aux autres motos si isPrimary=false", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue({ id: "m1", userId: "u1" });
    (prisma.motorcycle.update as jest.Mock).mockResolvedValue({ id: "m1", isPrimary: false });
    const res = await PATCH(makeReq({ isPrimary: false }), ctx("m1"));
    expect(res.status).toBe(200);
    expect(prisma.motorcycle.updateMany).not.toHaveBeenCalled();
  });

  it("retourne 500 en cas d'erreur interne", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockRejectedValue(new Error("DB"));
    const res = await PATCH(makeReq({ isPrimary: true }), ctx("m1"));
    expect(res.status).toBe(500);
  });
});
