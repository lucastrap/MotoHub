/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { motorcycle: { findMany: jest.fn(), create: jest.fn() } },
}));
const cookieGet = jest.fn();
jest.mock("next/headers", () => ({ cookies: () => ({ get: cookieGet }) }));
jest.mock("@/lib/auth", () => ({ verifyAuth: jest.fn() }));

import { GET, POST } from "@/app/api/motorcycles/route";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

const makeReq = (body?: unknown) => ({ json: async () => body }) as Request;
const authAs = (sub: string) => {
  cookieGet.mockReturnValue({ value: "tok" });
  (verifyAuth as jest.Mock).mockResolvedValue({ sub });
};
const noAuth = () => cookieGet.mockReturnValue(undefined);

const validMoto = { brand: "Yamaha", model: "MT-07", year: 2022, currentMileage: 12500 };

describe("GET /api/motorcycles", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 401 sans cookie de session", async () => {
    noAuth();
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it("retourne 401 si le token est invalide", async () => {
    cookieGet.mockReturnValue({ value: "bad" });
    (verifyAuth as jest.Mock).mockRejectedValue(new Error("expired"));
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it("retourne 200 et la liste des motos de l'utilisateur", async () => {
    authAs("u1");
    (prisma.motorcycle.findMany as jest.Mock).mockResolvedValue([validMoto]);
    const res = await GET(makeReq());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([validMoto]);
    expect(prisma.motorcycle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "u1" } })
    );
  });

  it("retourne 500 en cas d'erreur base de données", async () => {
    authAs("u1");
    (prisma.motorcycle.findMany as jest.Mock).mockRejectedValue(new Error("DB"));
    const res = await GET(makeReq());
    expect(res.status).toBe(500);
  });
});

describe("POST /api/motorcycles", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 401 sans authentification", async () => {
    noAuth();
    const res = await POST(makeReq(validMoto));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si les données sont invalides (marque vide)", async () => {
    authAs("u1");
    const res = await POST(makeReq({ ...validMoto, brand: "" }));
    expect(res.status).toBe(400);
  });

  it("retourne 201 et crée la moto rattachée à l'utilisateur", async () => {
    authAs("u1");
    (prisma.motorcycle.create as jest.Mock).mockResolvedValue({ id: "m1", ...validMoto });
    const res = await POST(makeReq({ ...validMoto, purchaseDate: "2022-06-15" }));
    expect(res.status).toBe(201);
    expect(prisma.motorcycle.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "u1" }) })
    );
  });

  it("retourne 500 en cas d'erreur interne", async () => {
    authAs("u1");
    (prisma.motorcycle.create as jest.Mock).mockRejectedValue(new Error("DB"));
    const res = await POST(makeReq(validMoto));
    expect(res.status).toBe(500);
  });
});
