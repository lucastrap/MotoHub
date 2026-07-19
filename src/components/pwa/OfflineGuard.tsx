"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Redirige vers /offline dès que le navigateur perd le réseau, au lieu de
 * laisser afficher une page en cache (login, dashboard…) inutilisable hors ligne.
 * Le fallback natif de next-pwa ne se déclenche que si une navigation échoue ;
 * ce garde couvre le cas où la page demandée est déjà en cache.
 */
export default function OfflineGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const redirectIfOffline = () => {
      if (!navigator.onLine && pathname !== "/offline") {
        router.replace("/offline");
      }
    };

    redirectIfOffline();
    window.addEventListener("offline", redirectIfOffline);
    return () => window.removeEventListener("offline", redirectIfOffline);
  }, [pathname, router]);

  return null;
}
