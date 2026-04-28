"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

export default function GaragePage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  async function fetchMotorcycles() {
    try {
      const res = await fetch("/api/motorcycles");
      if (res.ok) setMotorcycles(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMotorcycles();
  }, []);

  async function setPrimary(id: string) {
    setSettingPrimary(id);
    try {
      const res = await fetch(`/api/motorcycles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      if (res.ok) {
        setMotorcycles((prev) =>
          prev.map((m) => ({ ...m, isPrimary: m.id === id }))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSettingPrimary(null);
    }
  }

  return (
    <AppLayout title="Mon Garage">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {motorcycles.length > 0
            ? `${motorcycles.length} moto${motorcycles.length > 1 ? "s" : ""} enregistrée${motorcycles.length > 1 ? "s" : ""}`
            : "Aucune moto"}
        </p>
        <Button asChild>
          <Link href="/garage/new">+ Ajouter une moto</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground animate-pulse">Chargement de votre garage...</p>
      ) : motorcycles.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed">
          <h3 className="text-lg font-medium mb-2">Aucune moto pour le moment</h3>
          <p className="text-muted-foreground mb-4">
            Ajoutez votre première moto pour commencer à suivre son entretien.
          </p>
          <Button asChild variant="outline">
            <Link href="/garage/new">Ajouter ma moto</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motorcycles.map((moto) => (
            <div
              key={moto.id}
              className={`bg-card rounded-xl border p-6 shadow-sm flex flex-col relative overflow-hidden transition-colors ${
                moto.isPrimary ? "border-primary/50 ring-1 ring-primary/20" : "hover:border-border/80"
              }`}
            >
              {/* Gradient accent for primary */}
              {moto.isPrimary && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />
              )}

              <div className="mb-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-bold leading-tight">
                    {moto.brand} <span className="text-primary">{moto.model}</span>
                  </h3>
                  {moto.isPrimary && (
                    <span className="shrink-0 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      ⭐ Principale
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mt-1">{moto.year}</p>
              </div>

              <div className="space-y-2 mt-auto text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kilométrage</span>
                  <span className="font-medium">{moto.currentMileage.toLocaleString()} km</span>
                </div>
                {moto.color && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Couleur</span>
                    <span className="font-medium capitalize">{moto.color}</span>
                  </div>
                )}
                {moto.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Immatriculation</span>
                    <span className="font-medium uppercase tracking-widest">{moto.licensePlate}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" asChild>
                    <Link href={`/maintenance?motoId=${moto.id}`}>Historique</Link>
                  </Button>
                  <Button className="flex-1" asChild>
                    <Link href={`/maintenance/new?motoId=${moto.id}`}>+ Entretien</Link>
                  </Button>
                </div>
                {!moto.isPrimary && (
                  <Button
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setPrimary(moto.id)}
                    disabled={settingPrimary === moto.id}
                  >
                    {settingPrimary === moto.id ? "Mise à jour..." : "⭐ Définir comme moto principale"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}