import Transport from "winston-transport";
import * as Sentry from "@sentry/nextjs";


export class SentryTransport extends Transport {
  log(info: Record<string, unknown>, next: () => void): void {
    setImmediate(() => this.emit("logged", info));

    try {
      const { level, message, error, timestamp, ...meta } = info;
      const texte = String(message ?? "");

      if (level === "error") {

        const exception = error instanceof Error ? error : new Error(texte);
        Sentry.captureException(exception, {
          level: "error",
          extra: { message: texte, timestamp, ...meta },
        });
      } else if (level === "warn") {
        Sentry.captureMessage(texte, {
          level: "warning",
          extra: { timestamp, ...meta },
        });
      }
    } catch {

    }

    next();
  }
}

/**
 * Le transport n'est branché que si un DSN est configuré.
 */
export function isSentryEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN);
}
