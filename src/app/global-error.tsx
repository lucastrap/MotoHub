"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/**
 * Filet de sécurité de dernier recours.
 *
 * Une erreur levée pendant le rendu React remonte jusqu'à la racine et remplace
 * l'application par une page blanche. Sans ce composant, l'incident le plus
 * visible pour l'utilisateur serait le seul que le collecteur ne verrait pas :
 * il survient hors du cycle des routes API, et rien ne le journalise.
 *
 * `global-error` remplace le layout racine, d'où les balises html/body.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          background: "#090909",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          margin: 0,
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
            Une erreur inattendue est survenue
          </h1>
          <p style={{ opacity: 0.75, marginBottom: "1.5rem" }}>
            L&apos;incident a été signalé automatiquement. Vous pouvez recharger la page
            pour reprendre votre navigation.
          </p>
          {/* Référence à citer dans un signalement : elle permet de retrouver
              l'événement exact côté collecteur. */}
          {error.digest && (
            <p style={{ opacity: 0.5, fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Référence : {error.digest}
            </p>
          )}
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.625rem 1.25rem",
              border: "1px solid #f5f5f5",
              borderRadius: "0.375rem",
              color: "#f5f5f5",
              textDecoration: "none",
            }}
          >
            Retour à l&apos;accueil
          </a>
        </main>
      </body>
    </html>
  );
}
