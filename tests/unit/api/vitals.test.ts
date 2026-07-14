/**
 * @jest-environment node
 */
jest.mock("@/lib/logger", () => ({
  __esModule: true,
  default: { info: jest.fn(), error: jest.fn() },
}));

import { POST } from "@/app/api/monitoring/vitals/route";
import logger from "@/lib/logger";

const makeReq = (body: unknown) => ({ json: async () => body }) as unknown as Request;

describe("POST /api/monitoring/vitals", () => {
  beforeEach(() => jest.clearAllMocks());

  it("journalise une métrique valide et répond 204", async () => {
    const res = await POST(
      makeReq({ name: "LCP", value: 1234.56, id: "v1-abc", rating: "good" })
    );

    expect(res.status).toBe(204);
    expect(logger.info).toHaveBeenCalledWith(
      "web-vitals",
      expect.objectContaining({ metric: "LCP", value: 1235, rating: "good" })
    );
  });

  it("accepte une métrique sans rating (rating par défaut)", async () => {
    const res = await POST(makeReq({ name: "CLS", value: 0.02, id: "v2" }));

    expect(res.status).toBe(204);
    expect(logger.info).toHaveBeenCalledWith(
      "web-vitals",
      expect.objectContaining({ metric: "CLS", rating: "n/a" })
    );
  });

  it("retourne 400 si la charge utile est invalide (Zod)", async () => {
    const res = await POST(makeReq({ name: "LCP" }));

    expect(res.status).toBe(400);
    expect(logger.info).not.toHaveBeenCalled();
  });

  it("retourne 500 si le corps n'est pas du JSON", async () => {
    const badReq = {
      json: async () => {
        throw new Error("invalid json");
      },
    } as unknown as Request;

    const res = await POST(badReq);
    expect(res.status).toBe(500);
  });
});
