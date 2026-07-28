/**
 * @jest-environment node
 */
import {
  DB_LATENCY_DEGRADED_MS,
  contexteDeploiement,
  qualifierLatence,
} from "@/lib/supervision";

describe("qualifierLatence   seuil de dégradation", () => {
  it("qualifie une latence normale en ok", () => {
    expect(qualifierLatence(12)).toBe("ok");
  });

  it("considère le seuil lui-même comme acceptable", () => {
    expect(qualifierLatence(DB_LATENCY_DEGRADED_MS)).toBe("ok");
  });

  it("bascule en dégradé strictement au-dessus du seuil", () => {
    expect(qualifierLatence(DB_LATENCY_DEGRADED_MS + 1)).toBe("degraded");
  });
});

describe("contexteDeploiement   rattachement d'une alerte à une version", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it("reprend les variables fournies par Vercel", () => {
    process.env.VERCEL_ENV = "production";
    process.env.VERCEL_GIT_COMMIT_SHA = "a265c88f0e1d2c3b4a5";

    const ctx = contexteDeploiement();
    expect(ctx.environment).toBe("production");
    // Le SHA est tronqué à 7 caractères, format usuel des références Git courtes
    expect(ctx.commit).toBe("a265c88");
    expect(typeof ctx.uptimeSeconds).toBe("number");
  });

  it("retombe sur des valeurs locales hors plateforme", () => {
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL_GIT_COMMIT_SHA;

    const ctx = contexteDeploiement();
    expect(ctx.commit).toBe("local");
    expect(ctx.environment).toBeDefined();
    expect(ctx.version).toBeDefined();
  });
});
