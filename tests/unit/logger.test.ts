/**
 * @jest-environment node
 */
import logger from "@/lib/logger";

describe("logger Winston", () => {
  it("expose les niveaux de log standards", () => {
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.warn).toBe("function");
  });

  it("journalise un message avec métadonnées sans lever d'erreur", () => {
    expect(() => logger.info("test message", { db: "connected", latencyMs: 4 })).not.toThrow();
  });

  it("journalise un message simple sans métadonnées", () => {
    expect(() => logger.info("simple message")).not.toThrow();
  });

  it("journalise une erreur sans lever d'exception", () => {
    expect(() => logger.error("boom", { error: new Error("x") })).not.toThrow();
  });
});
