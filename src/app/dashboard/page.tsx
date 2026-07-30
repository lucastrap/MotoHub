"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { getUpcomingMaintenance } from "@/lib/maintenance/schedule";
import { typeIcon, typeLabel } from "@/lib/maintenance/icons";
import { UpcomingRow } from "@/components/moto/UpcomingRow";
import { formatEuros, formatKm } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMotorcycle } from "@fortawesome/free-solid-svg-icons";
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
  photoUrl: string | null;
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
          // Actually filter by motorcycleId   need separate fetch
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
          <h3 className="text-xl font-bold mb-2">Votre garage est vide</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Ajoutez une moto pour suivre son entretien.
          </p>
          <Button asChild size="lg">
            <Link href="/garage/new">Ajouter ma moto</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Moto principale */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="relative md:w-2/5 aspect-[16/10] md:aspect-auto bg-muted/30 shrink-0">
              {primary.photoUrl ? (
                <Image
                  src={primary.photoUrl}
                  alt={`${primary.brand} ${primary.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <FontAwesomeIcon icon={faMotorcycle} className="h-10 w-10 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="p-8 flex flex-col justify-center flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                Moto principale
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase mb-2">
                {primary.brand} <span className="text-primary">{primary.model}</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                {primary.year} · {formatKm(primary.currentMileage)} km
                {primary.licensePlate && ` · ${primary.licensePlate}`}
              </p>

              <dl className="grid grid-cols-2 gap-6 mb-8 max-w-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Dépenses</dt>
                  <dd className="text-2xl font-bold">{formatEuros(totalCost)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Kilométrage</dt>
                  <dd className="text-2xl font-bold">{formatKm(primary.currentMileage)}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/maintenance/new?motoId=${primary.id}`}>Ajouter une intervention</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/maintenance?motoId=${primary.id}`}>Voir le carnet</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Dernière intervention + Échéances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dernière intervention */}
            <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Dernière intervention</h3>
                <Link href={`/maintenance?motoId=${primary.id}`} className="text-sm font-medium text-primary hover:underline">
                  Voir tout
                </Link>
              </div>
              {lastIntervention ? (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border">
                    <FontAwesomeIcon
                      icon={typeIcon(lastIntervention.type)}
                      className="h-5 w-5 text-muted-foreground shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{typeLabel(lastIntervention.type)}</p>
                      {lastIntervention.description && (
                        <p className="text-sm text-muted-foreground truncate">{lastIntervention.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">
                        {format(new Date(lastIntervention.date), "d MMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatKm(lastIntervention.mileage)} km</p>
                    </div>
                  </div>
                  {lastIntervention.cost != null && (
                    <p className="text-sm text-muted-foreground px-1">
                      Coût : <span className="font-semibold text-foreground">{formatEuros(lastIntervention.cost)}</span>
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
                <h3 className="text-lg font-bold">Prochaines échéances</h3>
              </div>
              <div className="space-y-3 flex-1">
                {upcoming.map((item) => (
                  <UpcomingRow key={item.type} item={item} />
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
                            Principale
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {moto.year} · {formatKm(moto.currentMileage)} km
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