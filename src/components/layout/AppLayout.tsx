import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMotorcycle,
  faGaugeHigh,
  faWrench,
  faCogs,
  faNewspaper,
  faCloudSun,
  faArrowRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

export function AppLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Tableau de Bord", icon: faGaugeHigh },
    { href: "/garage", label: "Mon Garage", icon: faMotorcycle },
    { href: "/maintenance", label: "Historique", icon: faWrench },
    { href: "/pieces", label: "Pièces & Achat", icon: faCogs },
    { href: "/news", label: "Actu Moto", icon: faNewspaper },
    { href: "/weather", label: "Météo Pilote", icon: faCloudSun },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* RGAA 12.7   lien d'évitement vers le contenu principal */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 md:h-screen sticky top-0 flex flex-col items-center py-6 md:py-8 shadow-xl z-20">
        <div className="mb-8 px-6 text-center">
           <Link href="/dashboard" className="inline-flex items-center gap-3" aria-label="MotoTrack   accueil">
             <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/30">
                <FontAwesomeIcon icon={faMotorcycle} className="h-6 w-6" aria-hidden="true" />
             </div>
             <h1 className="text-2xl font-black uppercase tracking-tighter">Moto<span className="text-primary">Track</span></h1>
           </Link>
        </div>
        <nav aria-label="Navigation principale" className="flex flex-row md:flex-col gap-2 w-full px-4 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all w-full min-w-max md:min-w-0 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} aria-hidden="true" className={`text-lg ${isActive ? "opacity-100" : "opacity-60"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-4 w-full pt-8 hidden md:block">
          <Link
            href="/api/auth/logout"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} aria-hidden="true" />
            Déconnexion
          </Link>
        </div>
      </aside>

      <main id="main-content" className="flex-1 overflow-x-hidden">
        <header className="h-20 bg-background/80 backdrop-blur border-b flex items-center px-6 md:px-12 sticky top-0 z-10 transition-shadow">
          <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
        </header>
        <div className="p-6 md:p-12 pb-24 md:pb-12 mx-auto max-w-7xl animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
