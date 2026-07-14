/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    maintenance: { findMany: jest.fn(), create: jest.fn() },
    motorcycle: { findFirst: jest.fn(), update: jest.fn() },
  },
}));
const cookieGet = jest.fn();
jest.mock("next/headers", () => ({ cookies: () => ({ get: cookieGet }) }));
jest.mock("@/lib/auth", () => ({ verifyAuth: jest.fn() }));

import { GET, POST } from "@/app/api/maintenances/route";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

const makeReq = (url: string, body?: unknown) =>
  ({ url, json: async () => body }) as Request;
const authAs = (sub: string) => {
  cookieGet.mockReturnValue({ value: "tok" });
  (verifyAuth as jest.Mock).mockResolvedValue({ sub });
};

const validMaint = {
  motorcycleId: "3b241101-e2bb-4255-8caf-4136c566a962",
  type: "OIL_CHANGE",
  date: "2026-04-15",
  mileage: 13200,
  description: "Vidange complète",
  cost: 89,
};

describe("GET /api/maintenances", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 401 sans authentification", async () => {
    cookieGet.mockReturnValue(undefined);
    const res = await GET(makeReq("http://localhost/api/maintenances"));
    expect(res.status).toBe(401);
  });

  it("retourne toutes les interventions de l'utilisateur", async () => {
    authAs("u1");
    (prisma.maintenance.findMany as jest.Mock).mockResolvedValue([validMaint]);
    const res = await GET(makeReq("http://localhost/api/maintenances"));
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("filtre par moto quand le paramètre motoId est fourni", async () => {
    authAs("u1");
    (prisma.maintenance.findMany as jest.Mock).mockResolvedValue([]);
    await GET(makeReq("http://localhost/api/maintenances?motoId=m1"));
    expect(prisma.maintenance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ motorcycleId: "m1" }),
      })
    );
  });

  it("retourne 500 en cas d'erreur base de données", async () => {
    authAs("u1");
    (prisma.maintenance.findMany as jest.Mock).mockRejectedValue(new Error("DB"));
    const res = await GET(makeReq("http://localhost/api/maintenances"));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/maintenances", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 401 sans authentification", async () => {
    cookieGet.mockReturnValue(undefined);
    const res = await POST(makeReq("http://localhost/api/maintenances", validMaint));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si les données sont invalides (type inconnu)", async () => {
    authAs("u1");
    const res = await POST(
      makeReq("http://localhost/api/maintenances", { ...validMaint, type: "UNKNOWN" })
    );
    expect(res.status).toBe(400);
  });

  it("retourne 403 si la moto n'appartient pas à l'utilisateur", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeReq("http://localhost/api/maintenances", validMaint));
    expect(res.status).toBe(403);
  });

  it("crée l'intervention et met à jour le kilométrage si supérieur", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue({
      id: "m1", currentMileage: 12500,
    });
    (prisma.maintenance.create as jest.Mock).mockResolvedValue({ id: "int1" });
    const res = await POST(makeReq("http://localhost/api/maintenances", validMaint));
    expect(res.status).toBe(201);
    expect(prisma.motorcycle.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { currentMileage: 13200 } })
    );
  });

  it("ne met pas à jour le kilométrage si l'intervention est antérieure", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue({
      id: "m1", currentMileage: 20000,
    });
    (prisma.maintenance.create as jest.Mock).mockResolvedValue({ id: "int1" });
    const res = await POST(makeReq("http://localhost/api/maintenances", validMaint));
    expect(res.status).toBe(201);
    expect(prisma.motorcycle.update).not.toHaveBeenCalled();
  });

  it("retourne 500 en cas d'erreur interne", async () => {
    authAs("u1");
    (prisma.motorcycle.findFirst as jest.Mock).mockResolvedValue({ id: "m1", currentMileage: 0 });
    (prisma.maintenance.create as jest.Mock).mockRejectedValue(new Error("DB"));
    const res = await POST(makeReq("http://localhost/api/maintenances", validMaint));
    expect(res.status).toBe(500);
  });
});
