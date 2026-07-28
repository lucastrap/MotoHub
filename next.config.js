/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',

  register: false,
  skipWaiting: true,

  buildExcludes: [/app-build-manifest\.json$/],
  fallbacks: {
    document: '/_offline',
  },
})

// OWASP A05   En-têtes de sécurité HTTP appliqués à toutes les réponses.
// La CSP est déclarée en "Report-Only" pour ne pas casser le rendu (Three.js,
// PWA, styles inline de Next) tout en préparant une future politique bloquante.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // Sentry : point d'ingestion des erreurs (collecte d'incidents)
      "connect-src 'self' https://vpic.nhtsa.dot.gov https://news.google.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
      "font-src 'self' data:",
      // Le rejeu de session Sentry compresse les données dans un worker
      "worker-src 'self' blob:",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  reactStrictMode: true,
  // Requis en Next 14 pour que `src/instrumentation.ts` soit exécuté au démarrage
  // du serveur (initialisation Sentry côté Node et Edge).
  experimental: {
    instrumentationHook: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

// Sentry enveloppe la configuration en dernier
module.exports = withSentryConfig(withPWA(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Journalise le travail du plugin en CI
  silent: !process.env.CI,
  telemetry: false,


  sourcemaps: { disable: true },

  webpack: {
    treeshake: { removeDebugLogging: true },
  },
})
