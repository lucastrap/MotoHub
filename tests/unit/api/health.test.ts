/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { $queryRaw: jest.fn() },
}));
jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn() },
}));

import { GET } from "@/app/api/health/route";
import prisma from "@/lib/prisma";

describe("GET /api/health", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retourne 200 et db=connected quand la base répond", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.db).toBe("connected");
    expect(typeof json.latencyMs).toBe("number");
  });

  it("retourne 503 et db=unreachable quand la base est injoignable", async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.status).toBe("error");
    expect(json.db).toBe("unreachable");
  });
});
