/**
 * @jest-environment node
 */
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: { $queryRaw: jest.fn() },
}));
jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

import { GET } from "@/app/api/health/route";
import { DB_LATENCY_DEGRADED_MS } from "@/lib/supervision";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * Force une latence mesurée : la route lit `Date.now()` avant puis après la
 * requête, on contrôle donc l'écart entre les deux appels successifs.
 */
function withMeasuredLatency(latencyMs: number) {
  const base = 1_000_000;
  jest
    .spyOn(Date, "now")
    .mockReturnValueOnce(base)
    .mockReturnValue(base + latencyMs);
}

describe("GET /api/health", () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it("retourne 200 et db=connected quand la base répond", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.db).toBe("connected");
    expect(typeof json.latencyMs).toBe("number");
  });

  it("expose les indicateurs de supervision attendus par les sondes", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);
    const json = await (await GET()).json();

    // Contexte de déploiement   rattache une alerte à une version précise
    expect(json).toHaveProperty("version");
    expect(json).toHaveProperty("environment");
    expect(json).toHaveProperty("commit");
    expect(typeof json.uptimeSeconds).toBe("number");

    // Détail par sonde
    expect(json.checks.database.status).toBe("ok");
    expect(json.checks.database.thresholdMs).toBe(DB_LATENCY_DEGRADED_MS);
    expect(typeof json.checks.database.latencyMs).toBe("number");
  });

  it("déclare l'état dégradé (200) quand la latence dépasse le seuil", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);
    withMeasuredLatency(DB_LATENCY_DEGRADED_MS + 1);

    const res = await GET();
    const json = await res.json();

    // Le service répond toujours : pas d'alerte d'indisponibilité, mais un signal
    expect(res.status).toBe(200);
    expect(json.status).toBe("degraded");
    expect(json.db).toBe("connected");
    expect(json.checks.database.status).toBe("degraded");
    expect(logger.warn).toHaveBeenCalled();
  });

  it("reste en état ok quand la latence est exactement au seuil", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ "?column?": 1 }]);
    withMeasuredLatency(DB_LATENCY_DEGRADED_MS);

    const json = await (await GET()).json();
    expect(json.status).toBe("ok");
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it("retourne 503 et db=unreachable quand la base est injoignable", async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await GET();
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.status).toBe("error");
    expect(json.db).toBe("unreachable");
    expect(json.checks.database.status).toBe("error");
    expect(logger.error).toHaveBeenCalled();
  });
});
