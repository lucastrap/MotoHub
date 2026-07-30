/**
 * @jest-environment node
 */
jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

import * as Sentry from "@sentry/nextjs";
import { SentryTransport, isSentryEnabled } from "@/lib/sentryTransport";

describe("SentryTransport   pont journalisation → collecteur d'incidents", () => {
  const transport = new SentryTransport({ level: "warn" });
  const next = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("transmet une erreur portant une vraie Error en conservant sa pile", () => {
    const error = new Error("connexion base perdue");
    transport.log({ level: "error", message: "Health check failed", error, latencyMs: 12 }, next);

    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
    const [exception, options] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(exception).toBe(error);
    expect(options.level).toBe("error");
    expect(options.extra.latencyMs).toBe(12);
    expect(next).toHaveBeenCalled();
  });

  it("fabrique une Error quand l'appelant n'en fournit pas", () => {
    transport.log({ level: "error", message: "échec sans objet Error" }, next);

    const [exception] = (Sentry.captureException as jest.Mock).mock.calls[0];
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe("échec sans objet Error");
  });

  it("transmet un avertissement en message de niveau warning", () => {
    transport.log({ level: "warn", message: "latence au-dessus du seuil", latencyMs: 780 }, next);

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      "latence au-dessus du seuil",
      expect.objectContaining({ level: "warning" })
    );
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("ignore les niveaux informatifs   ils n'ont pas leur place dans le collecteur", () => {
    transport.log({ level: "info", message: "Health check passed" }, next);

    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("n'interrompt jamais la requête si le collecteur échoue", () => {
    (Sentry.captureException as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Sentry injoignable");
    });

    expect(() =>
      transport.log({ level: "error", message: "boom" }, next)
    ).not.toThrow();
    expect(next).toHaveBeenCalled();
  });
});

describe("isSentryEnabled", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it("est désactivé sans DSN configuré", () => {
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    expect(isSentryEnabled()).toBe(false);
  });

  it("est activé dès qu'un DSN est présent", () => {
    process.env.SENTRY_DSN = "https://exemple@o0.ingest.sentry.io/0";
    expect(isSentryEnabled()).toBe(true);
  });
});
