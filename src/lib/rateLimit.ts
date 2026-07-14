// OWASP A07 — Limitation de débit (fenêtre glissante en mémoire).
// Protège les endpoints sensibles (authentification) contre le bourrage
// d'identifiants et les attaques par force brute.
//
// Note : le stockage en mémoire est adapté à un serveur unique / au développement.
// En production multi-instances (serverless), on brancherait le même contrat sur
// un magasin partagé (ex. Redis) sans changer les appels côté routes.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Autorise `limit` requêtes par `windowMs` pour une clé donnée (ex. `login:<ip>`).
 */
export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

/** Extrait l'IP cliente de façon défensive à partir des en-têtes de la requête. */
export function getClientIp(req: Request): string {
  const fwd = req.headers?.get?.("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers?.get?.("x-real-ip") ?? "unknown";
}

/** Réinitialise l'état (utilisé par les tests). */
export function resetRateLimit(): void {
  buckets.clear();
}
