import { test, expect } from "@playwright/test";

// RT-15 — Endpoint de supervision (cahier de recettes)
test.describe("API de supervision /api/health", () => {
  test("répond avec un contrat de santé structuré", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();

    // Le contrat expose systématiquement l'état, la sonde DB et la latence
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("db");
    expect(typeof body.latencyMs).toBe("number");

    // Avec la base disponible (environnement CI/prod) : 200 + status ok
    // Sans base : 503 + status error — les deux cas restent contractuels
    expect([200, 503]).toContain(res.status());
    if (res.status() === 200) {
      expect(body.status).toBe("ok");
      expect(body.db).toBe("connected");
    } else {
      expect(body.status).toBe("error");
    }
  });
});
