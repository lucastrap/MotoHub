"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getUpcomingMaintenance } from "@/lib/maintenance/schedule";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string | null;
  currentMileage: number;
  licensePlate: string | null;
  isPrimary: boolean;
};

type Maintenance = {
  id: string;
  type: string;
  date: string;
  mileage: number;
  description: string;
  cost: number | null;
  motorcycle: { brand: string; model: string };
};

const TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  TIRE_CHANGE: "Pneus",
  BRAKE_SERVICE: "Freins",
  CHAIN_SERVICE: "Chaîne",
  GENERAL_SERVICE: "Révision générale",
  REPAIR: "Réparation",
  OTHER: "Autre",
};

const TYPE_ICONS: Record<string, string> = {
  OIL_CHANGE: "🛢️",
  TIRE_CHANGE: "🔵",
  BRAKE_SERVICE: "🔴",
  CHAIN_SERVICE: "⚙️",
  GENERAL_SERVICE: "🔧",
  REPAIR: "🛠️",
  OTHER: "📋",
};



export default function DashboardPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [primary, setPrimary] = useState<Motorcycle | null>(null);
  const [lastIntervention, setLastIntervention] = useState<Maintenance | null>(null);
  const [lastByType, setLastByType] = useState<Record<string, Maintenance>>({});
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [motoRes, maintRes] = await Promise.all([
          fetch("/api/motorcycles"),
          fetch("/api/maintenances"),
        ]);

        if (!motoRes.ok || !maintRes.ok) return;

        const motos: Motorcycle[] = await motoRes.json();
        const maints: Maintenance[] = await maintRes.json();

        setMotorcycles(motos);

        const primaryMoto = motos.find((m) => m.isPrimary) ?? motos[0] ?? null;
        setPrimary(primaryMoto);

        if (primaryMoto) {
          const motoMaints = maints.filter(
            (m) => m.motorcycle.brand === primaryMoto.brand && m.motorcycle.model === primaryMoto.model
          );
          // Actually filter by motorcycleId — need separate fetch
          const primMaintRes = await fetch(`/api/maintenances?motoId=${primaryMoto.id}`);
          if (primMaintRes.ok) {
            const primMaints: Maintenance[] = await primMaintRes.json();
            setLastIntervention(primMaints[0] ?? null);

            // Build last by type map
            const byType: Record<string, Maintenance> = {};
            for (const m of primMaints) {
              if (!byType[m.type]) byType[m.type] = m;
            }
            setLastByType(byType);
          }
        }

        const cost = maints.reduce((acc, m) => acc + (m.cost ?? 0), 0);
        setTotalCost(cost);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const upcoming = primary ? getUpcomingMaintenance(primary.currentMileage, lastByType) : [];

  return (
    <AppLayout title="Tableau de bord">
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </div>
      ) : !primary ? (
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
          {/* Hero moto principale */}
          <div className="bg-card rounded-2xl border shadow-md overflow-hidden flex flex-col md:flex-row relative">
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
            <div className="p-8 md:w-2/3 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-4 w-max">
                ⭐ Moto Principale
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase mb-2">
                {primary.brand} <span className="text-primary">{primary.model}</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                {primary.year} • {primary.currentMileage.toLocaleString()} km
                {primary.licensePlate && ` • ${primary.licensePlate}`}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="shadow-lg">
                  <Link href={`/maintenance/new?motoId=${primary.id}`}>Nouveau service</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href={`/maintenance?motoId=${primary.id}`}>Historique complet</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/3 bg-muted/30 p-8 border-l flex flex-col gap-6 justify-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Dépenses totales</p>
                <p className="text-3xl font-bold">€{totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Kilométrage actuel</p>
                <p className="text-xl font-semibold">{primary.currentMileage.toLocaleString()} km</p>
              </div>
            </div>
          </div>

          {/* Dernière intervention + Échéances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dernière intervention */}
            <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Dernière Intervention</h3>
                <Link href={`/maintenance?motoId=${primary.id}`} className="text-sm font-medium text-primary hover:underline">
                  Voir tout
                </Link>
              </div>
              {lastIntervention ? (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border">
                    <div className="text-2xl">{TYPE_ICONS[lastIntervention.type] ?? "🔧"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{TYPE_LABELS[lastIntervention.type] ?? lastIntervention.type}</p>
                      <p className="text-sm text-muted-foreground truncate">{lastIntervention.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {format(new Date(lastIntervention.date), "d MMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">{lastIntervention.mileage.toLocaleString()} km</p>
                    </div>
                  </div>
                  {lastIntervention.cost != null && (
                    <p className="text-sm text-muted-foreground px-1">
                      Coût : <span className="font-semibold text-foreground">€{lastIntervention.cost.toFixed(2)}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-muted-foreground text-center bg-muted/10">
                  <div>
                    <p className="mb-2">Aucune intervention enregistrée.</p>
                    <Button variant="link" asChild className="text-primary p-0">
                      <Link href={`/maintenance/new?motoId=${primary.id}`}>Ajouter le premier service</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Prochaines échéances */}
            <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">⚠️ Prochaines Échéances</h3>
              </div>
              <div className="space-y-3 flex-1">
                {upcoming.map((item) => (
                  <div
                    key={item.type}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      item.status === "overdue"
                        ? "bg-destructive/10 border-destructive/30 text-destructive"
                        : item.status === "soon"
                          ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                          : "bg-muted/20 border-border text-foreground"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                    {item.status === "soon" && (
                      <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full">
                        Bientôt
                      </span>
                    )}
                    {item.status === "overdue" && (
                      <span className="text-xs font-bold text-destructive bg-destructive/20 px-2 py-0.5 rounded-full">
                        En retard
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Toutes les motos */}
          {motorcycles.length > 1 && (
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Toutes mes motos</h3>
                <Link href="/garage" className="text-sm font-medium text-primary hover:underline">
                  Gérer le garage
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {motorcycles.map((moto) => (
                  <div
                    key={moto.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                      moto.isPrimary ? "border-primary/40 bg-primary/5" : "border-border bg-muted/10 hover:bg-muted/20"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">
                          {moto.brand} {moto.model}
                        </p>
                        {moto.isPrimary && (
                          <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                            ⭐ Principale
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {moto.year} • {moto.currentMileage.toLocaleString()} km
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/maintenance?motoId=${moto.id}`}>Historique</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}