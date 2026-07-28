
/** État de synthèse renvoyé par la sonde. */
export type EtatSante = "ok" | "degraded" | "error";


export const DB_LATENCY_DEGRADED_MS = 500;

/** Qualifie une mesure de latence au regard du seuil de dégradation. */
export function qualifierLatence(latencyMs: number): EtatSante {
  return latencyMs > DB_LATENCY_DEGRADED_MS ? "degraded" : "ok";
}


export function contexteDeploiement() {
  return {
    version: process.env.npm_package_version ?? "1.0.0",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    uptimeSeconds: Math.round(process.uptime()),
  };
}
