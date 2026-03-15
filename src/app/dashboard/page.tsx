"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Motorcycle } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const [motorcycle, setMotorcycle] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/motorcycles");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMotorcycle(data[0]);
          }
        }
      } catch (error) {
        console.error("Échec", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <AppLayout title="Tableau de bord">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      ) : !motorcycle ? (
        <div className="text-center p-16 bg-card rounded-2xl border border-dashed shadow-sm">
          <h3 className="text-xl font-bold mb-2">Bienvenue dans votre garage !</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ajoutez votre moto pour commencer le suivi.
          </p>
          <Button asChild size="lg">
            <Link href="/garage/new">Ajouter ma moto</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border shadow-md overflow-hidden flex flex-col md:flex-row relative">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            <div className="p-8 md:w-2/3 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4 w-max">
                Ma Moto Principale
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-2">
                {motorcycle.brand} <span className="text-primary">{motorcycle.model}</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Année {motorcycle.year} • {motorcycle.currentMileage.toLocaleString()} km
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="shadow-lg">
                  <Link href={`/maintenance/new?motoId=${motorcycle.id}`}>Nouveau service</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/maintenance?motoId=${motorcycle.id}`}>Historique complet</Link>
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/3 bg-muted/30 p-8 border-l flex flex-col gap-6 justify-center">
              <div>
                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Dépenses totales</p>
                 <p className="text-3xl font-bold">€0.00</p>
              </div>
              <div>
                 <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Prochain rendez-vous</p>
                 <p className="text-xl font-semibold">Aucun prévu</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Dernière Intervention</h3>
                <Link href="/maintenance" className="text-sm font-medium text-primary hover:underline">Voir tout</Link>
              </div>
              <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-muted-foreground text-center bg-muted/10">
                <div>
                  <p className="mb-2">Aucune intervention enregistrée.</p>
                  <Button variant="link" asChild className="text-primary p-0">
                    <Link href={`/maintenance/new?motoId=${motorcycle.id}`}>Ajouter le premier service</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold items-center flex gap-2">⚠️ Rappels & Échéances</h3>
              </div>
              <div className="space-y-4 flex-1">
                 <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-400">
                    <div className="mt-1 text-lg">⚙️</div>
                    <div>
                      <p className="font-semibold">Kit chaîne à vérifier</p>
                      <p className="text-sm opacity-80">Recommandé tous les 1000 km.</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 rounded-lg bg-muted text-muted-foreground">
                    <div className="mt-1 text-lg">🛢️</div>
                    <div>
                      <p className="font-medium text-foreground">Prochaine vidange</p>
                      <p className="text-sm">Pas d'urgence, passage vers {(motorcycle.currentMileage + 6000).toLocaleString()} km.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
