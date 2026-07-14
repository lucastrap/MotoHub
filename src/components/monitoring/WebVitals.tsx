"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Collecte les Core Web Vitals côté navigateur et les envoie à l'API de
 * supervision. On privilégie `navigator.sendBeacon` (envoi non bloquant,
 * fiable même lors de la fermeture de l'onglet) avec repli sur `fetch`.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: (metric as { rating?: string }).rating,
      navigationType: (metric as { navigationType?: string }).navigationType,
    });
    const url = "/api/monitoring/vitals";

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        body,
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  return null;
}
