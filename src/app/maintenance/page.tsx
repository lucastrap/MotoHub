"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Motorcycle = {
  id: string;
  brand: string;
  model: string;
  year: number;
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

const TYPE_LABELS: Record<string, string> = {
  OIL_CHANGE: "Vidange",
  TIRE_CHANGE: "Pneus",
  BRAKE_SERVICE: "Freins",
  CHAIN_SERVICE: "Chaîne",
  GENERAL_SERVICE: "Révision générale",
  REPAIR: "Réparation",
  OTHER: "Autre",
};

function MaintenanceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const motoId = searchParams.get("motoId") ?? "";

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceWithMoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch motorcycles for filter
  useEffect(() => {
    fetch("/api/motorcycles")
      .then((r) => r.ok ? r.json() : [])
      .then(setMotorcycles)
      .catch(() => {});
  }, []);

  // Fetch maintenances when filter changes
  useEffect(() => {
    setLoading(true);
    const url = motoId ? `/api/maintenances?motoId=${motoId}` : "/api/maintenances";
    fetch(url)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setMaintenances(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [motoId]);

  function handleFilterChange(id: string) {
    if (id) {
      router.push(`/maintenance?motoId=${id}`);
    } else {
      router.push("/maintenance");
    }
  }

  const selectedMoto = motorcycles.find((m) => m.id === motoId);

  return (
    <AppLayout title="Carnet d'entretien">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filtre par moto */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">Filtrer :</span>
          <button
            onClick={() => handleFilterChange("")}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors font-medium ${
              !motoId
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
            }`}
          >
            Toutes les motos
          </button>
          {motorcycles.map((m) => (
            <button
              key={m.id}
              onClick={() => handleFilterChange(m.id)}
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors font-medium ${
                motoId === m.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {m.brand} {m.model}
            </button>
          ))}
        </div>

        <Button asChild className="shrink-0">
          <Link href={`/maintenance/new${motoId ? `?motoId=${motoId}` : ""}`}>
            + Ajouter une intervention
          </Link>
        </Button>
      </div>

      {/* Résumé filtre actif */}
      {selectedMoto && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Affichage :</span>
          <span className="font-semibold text-foreground">
            {selectedMoto.brand} {selectedMoto.model} {selectedMoto.year}
          </span>
          <span>— {maintenances.length} intervention{maintenances.length > 1 ? "s" : ""}</span>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Chargement des entretiens...</p>
      ) : maintenances.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed">
          <h3 className="text-lg font-medium mb-2">Aucun historique d'entretien</h3>
          <p className="text-muted-foreground mb-4">
            {motoId
              ? "Aucune intervention enregistrée pour cette moto."
              : "Vous n'avez pas encore enregistré d'intervention."}
          </p>
          <Button asChild variant="outline">
            <Link href={`/maintenance/new${motoId ? `?motoId=${motoId}` : ""}`}>
              Ajouter une intervention
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Moto</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Kilométrage</th>
                  <th className="px-6 py-4 font-medium">Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {format(new Date(m.date), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {m.motorcycle.brand} {m.motorcycle.model}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {TYPE_LABELS[m.type] ?? m.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">
                      {m.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {m.mileage.toLocaleString()} km
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {m.cost != null ? `€${m.cost.toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function MaintenancePage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Carnet d'entretien">
          <p className="text-muted-foreground animate-pulse">Chargement des entretiens...</p>
        </AppLayout>
      }
    >
      <MaintenanceContent />
    </Suspense>
  );
}