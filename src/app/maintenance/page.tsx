"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { typeIcon, typeLabel } from "@/lib/maintenance/icons";
import { getUpcomingMaintenance } from "@/lib/maintenance/schedule";
import { UpcomingRow } from "@/components/moto/UpcomingRow";
import { formatEuros, formatKm } from "@/lib/format";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
  currentMileage: number;
};

type MaintenanceWithMoto = {
  id: string;
  type: string;
  date: string;
  mileage: number;
  description: string;
  cost: number | null;
  motorcycle: { brand: string; model: string };
};

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const motoId = searchParams.get("motoId") ?? "";

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceWithMoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/motorcycles")
      .then((r) => (r.ok ? r.json() : []))
      .then(setMotorcycles)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = motoId ? `/api/maintenances?motoId=${motoId}` : "/api/maintenances";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setMaintenances(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [motoId]);

  function filtrer(id: string) {
    router.push(id ? `/maintenance?motoId=${id}` : "/maintenance");
  }

  const motoChoisie = motorcycles.find((m) => m.id === motoId);

  // Les échéances n'ont de sens que pour une moto donnée : l'historique de
  // chaque type est propre à la machine.
  const dernierParType: Record<string, { mileage: number }> = {};
  if (motoChoisie) {
    for (const m of maintenances) {
      if (!dernierParType[m.type]) dernierParType[m.type] = { mileage: m.mileage };
    }
  }
  const echeances = motoChoisie
    ? getUpcomingMaintenance(motoChoisie.currentMileage, dernierParType)
    : [];

  const total = maintenances.reduce((acc, m) => acc + (m.cost ?? 0), 0);

  return (
    <AppLayout title="Carnet d'entretien">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => filtrer("")}
            aria-pressed={!motoId}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              !motoId
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
            }`}
          >
            Toutes les motos
          </button>
          {motorcycles.map((m) => (
            <button
              key={m.id}
              onClick={() => filtrer(m.id)}
              aria-pressed={motoId === m.id}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                motoId === m.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {m.brand} {m.model}
            </button>
          ))}
        </div>

        <Button asChild className="shrink-0">
          <Link href={`/maintenance/new${motoId ? `?motoId=${motoId}` : ""}`}>
            Ajouter une intervention
          </Link>
        </Button>
      </div>

      {/* Échéances à venir : c'est ici qu'on les cherche, pas seulement sur le
          tableau de bord. Nécessite de savoir de quelle moto on parle. */}
      {motoChoisie && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold">Prochaines échéances</h2>
          <div className="space-y-2">
            {echeances.map((item) => (
              <UpcomingRow key={item.type} item={item} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Calculé depuis le dernier entretien de chaque type et le kilométrage actuel
            ({formatKm(motoChoisie.currentMileage)} km).
          </p>
        </section>
      )}

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">
          Historique
          {maintenances.length > 0 && (
            <span className="ml-2 font-normal text-muted-foreground">
              {maintenances.length} intervention{maintenances.length > 1 ? "s" : ""}
            </span>
          )}
        </h2>
        {total > 0 && (
          <p className="text-sm text-muted-foreground">
            Total <span className="font-semibold text-foreground">{formatEuros(total)}</span>
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : maintenances.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="mb-2 text-lg font-medium">Aucune intervention</h3>
          <p className="mb-4 text-muted-foreground">
            {motoId
              ? "Rien d'enregistré pour cette moto."
              : "Vous n'avez encore rien enregistré."}
          </p>
          <Button asChild variant="outline">
            <Link href={`/maintenance/new${motoId ? `?motoId=${motoId}` : ""}`}>
              Ajouter une intervention
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Cartes en mobile : un tableau à six colonnes n'y tient pas. */}
          <ul className="space-y-3 md:hidden">
            {maintenances.map((m) => (
              <li key={m.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={typeIcon(m.type)} className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{typeLabel(m.type)}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {format(new Date(m.date), "d MMM yyyy", { locale: fr })}
                  </span>
                </div>
                {m.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{m.description}</p>
                )}
                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {m.motorcycle.brand} {m.motorcycle.model} · {formatKm(m.mileage)} km
                  </span>
                  {m.cost != null && <span className="font-medium">{formatEuros(m.cost)}</span>}
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Date</th>
                  <th scope="col" className="px-6 py-4 font-medium">Moto</th>
                  <th scope="col" className="px-6 py-4 font-medium">Type</th>
                  <th scope="col" className="px-6 py-4 font-medium">Description</th>
                  <th scope="col" className="px-6 py-4 font-medium">Kilométrage</th>
                  <th scope="col" className="px-6 py-4 font-medium">Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenances.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-muted/20">
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {format(new Date(m.date), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                      {m.motorcycle.brand} {m.motorcycle.model}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-2">
                        <FontAwesomeIcon icon={typeIcon(m.type)} className="h-3.5 w-3.5 text-muted-foreground" />
                        {typeLabel(m.type)}
                      </span>
                    </td>
                    <td className="max-w-xs truncate px-6 py-4 text-muted-foreground">
                      {m.description || <span className="text-muted-foreground/50">Non renseignée</span>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">{formatKm(m.mileage)} km</td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium">
                      {m.cost != null ? formatEuros(m.cost) : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppLayout>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Carnet d'entretien">
          <p className="text-muted-foreground">Chargement…</p>
        </AppLayout>
      }
    >
      <MaintenanceContent />
    </Suspense>
  );
}
