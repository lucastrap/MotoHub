"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type MaintenanceWithMoto = {
  id: string;
  type: string;
  date: string;
  mileage: number;
  description: string;
  cost: number | null;
  motorcycle: {
    brand: string;
    model: string;
  };
};

export default function MaintenancePage() {
  const searchParams = useSearchParams();
  const motoId = searchParams.get("motoId");
  
  const [maintenances, setMaintenances] = useState<MaintenanceWithMoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const url = motoId ? `/api/maintenances?motoId=${motoId}` : "/api/maintenances";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMaintenances(data);
        }
      } catch (error) {
        console.error("Failed to fetch maintenances", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [motoId]);

  return (
    <AppLayout title="Carnet d'entretien">
      <div className="mb-6 flex gap-4">
        <Button asChild>
          <Link href={`/maintenance/new${motoId ? `?motoId=${motoId}` : ''}`}>Ajouter une intervention</Link>
        </Button>
      </div>

      {loading ? (
        <p>Chargement des entretiens...</p>
      ) : maintenances.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed">
          <h3 className="text-lg font-medium mb-2">Aucun historique d'entretien</h3>
          <p className="text-muted-foreground mb-4">Vous n'avez pas encore enregistré d'intervention.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Moto</th>
                  <th className="px-6 py-4 font-medium">Type de service</th>
                  <th className="px-6 py-4 font-medium">Kilométrage</th>
                  <th className="px-6 py-4 font-medium">Coût</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(m.date), "d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {m.motorcycle.brand} {m.motorcycle.model}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {m.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">{m.mileage.toLocaleString()} km</td>
                    <td className="px-6 py-4">
                      {m.cost ? `€${m.cost.toFixed(2)}` : "-"}
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
