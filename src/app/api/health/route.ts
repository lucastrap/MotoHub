import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import {
  DB_LATENCY_DEGRADED_MS,
  contexteDeploiement,
  qualifierLatence,
} from "@/lib/supervision";

// Sonde de supervision   contrat consommé par :
//   • le workflow GitHub Actions `supervision.yml` (sonde interne, toutes les 15 min) ;
//   • la sonde externe UptimeRobot (toutes les 5 min) ;
//   • le scénario de recette RT-15 et le test e2e `api-health.spec.ts`.
//
// La route est rendue dynamiquement : sans cela, Next la met en cache statique au
// build et la sonde renvoie un état figé, donc inexploitable pour la supervision.
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    // Sonde base de données : requête volontairement triviale   elle mesure la
    // disponibilité et le temps d'aller-retour, pas la performance d'une requête métier.
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    const etat = qualifierLatence(latency);

    if (etat === "degraded") {
      // Journalisé en `warn` : ce niveau est remonté au collecteur d'incidents.
      logger.warn("Health check dégradé   latence base au-dessus du seuil", {
        latencyMs: latency,
        thresholdMs: DB_LATENCY_DEGRADED_MS,
      });
    } else {
      logger.info("Health check passed", { db: "connected", latencyMs: latency });
    }

    // 200 même en mode dégradé : le service rend le service. Seule
    // l'indisponibilité réelle (503) déclenche une alerte de niveau incident.
    return NextResponse.json(
      {
        // Indicateur de synthèse   c'est le champ interrogé par les sondes.
        status: etat,
        db: "connected",
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        ...contexteDeploiement(),
        checks: {
          database: {
            status: etat,
            latencyMs: latency,
            thresholdMs: DB_LATENCY_DEGRADED_MS,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const latency = Date.now() - start;
    logger.error("Health check failed   DB unreachable", { error, latencyMs: latency });

    return NextResponse.json(
      {
        status: "error",
        db: "unreachable",
        latencyMs: latency,
        timestamp: new Date().toISOString(),
        ...contexteDeploiement(),
        checks: {
          database: {
            status: "error",
            latencyMs: latency,
            thresholdMs: DB_LATENCY_DEGRADED_MS,
          },
        },
      },
      { status: 503 }
    );
  }
}
