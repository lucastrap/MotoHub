import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rateLimit";

describe("checkRateLimit   fenêtre glissante", () => {
  beforeEach(() => resetRateLimit());

  it("autorise les requêtes sous le seuil", () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit("k", 3).allowed).toBe(true);
    }
  });

  it("bloque au-delà du seuil et renvoie un délai d'attente", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("k", 3);
    const res = checkRateLimit("k", 3);
    expect(res.allowed).toBe(false);
    expect(res.remaining).toBe(0);
    expect(res.retryAfterMs).toBeGreaterThan(0);
  });

  it("isole les compteurs par clé", () => {
    checkRateLimit("a", 1);
    expect(checkRateLimit("a", 1).allowed).toBe(false);
    expect(checkRateLimit("b", 1).allowed).toBe(true);
  });

  it("réinitialise le compteur après expiration de la fenêtre", () => {
    checkRateLimit("k", 1, 10);
    expect(checkRateLimit("k", 1, 10).allowed).toBe(false);
    return new Promise((r) => setTimeout(r, 15)).then(() => {
      expect(checkRateLimit("k", 1, 10).allowed).toBe(true);
    });
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) =>
    ({ headers: { get: (k: string) => headers[k] ?? null } }) as unknown as Request;

  it("extrait la première IP de x-forwarded-for", () => {
    expect(getClientIp(req({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
  });

  it("se rabat sur x-real-ip puis 'unknown'", () => {
    expect(getClientIp(req({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(getClientIp(req({}))).toBe("unknown");
  });
});
