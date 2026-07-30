// Collecte des erreurs côté serveur : routes API et rendu serveur.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // Rattache chaque événement au déploiement exact qui l'a produit 
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: 0.1,
  sendDefaultPii: false,

  // Filtre de dernier recours : les corps de requête peuvent contenir un mot de
  // passe (route /api/auth/*). On les retire avant l'envoi.
  beforeSend(event) {
    if (event.request?.data) {
      event.request.data = "[retiré avant envoi]";
    }
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});
