"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/layout/AppLayout";
import { maintenanceSchema, aujourdhui, type MaintenanceInput } from "@/lib/schemas/maintenance";
import { formatKm } from "@/lib/format";
import { Motorcycle } from "@prisma/client";

type MaintenanceFormValues = MaintenanceInput;

function AddMaintenanceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMotoId = searchParams.get("motoId");

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      motorcycleId: defaultMotoId || "",
      date: aujourdhui(),
      mileage: 0,
      description: "",
    }
  });

  const motoSelectionnee = motorcycles.find((m) => m.id === watch("motorcycleId"));
  const kmSaisi = Number(watch("mileage"));

  // Saisir un kilométrage inférieur à celui de la moto est légitime (on
  // rattrape un entretien ancien), mais c'est souvent une faute de frappe :
  // on prévient sans bloquer.
  const kmEnRetrait =
    motoSelectionnee && Number.isFinite(kmSaisi) && kmSaisi < motoSelectionnee.currentMileage;

  useEffect(() => {
    async function fetchMotorcycles() {
      try {
        const res = await fetch("/api/motorcycles");
        if (res.ok) {
          const data = await res.json();
          setMotorcycles(data);
        }
      } catch (error) {
        console.error("Failed to fetch motorcycles", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMotorcycles();
  }, []);

  async function onSubmit(data: MaintenanceFormValues) {
    setError(null);
    try {
      const response = await fetch("/api/maintenances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Échec de l'enregistrement de l'entretien");
      }

      router.push("/maintenance");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AppLayout title="Nouvelle intervention">
      <div className="bg-card rounded-xl border p-6 md:p-8 max-w-2xl shadow-sm">
        {loading ? (
          <p>Chargement de votre garage...</p>
        ) : motorcycles.length === 0 ? (
          <div className="text-center py-8">
            <p className="mb-4">Vous devez d'abord ajouter une moto avant d'enregistrer un entretien.</p>
            <Button onClick={() => router.push("/garage/new")}>Ajouter une moto</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Motorcycle Selection */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="motorcycleId">Moto *</Label>
                <select
                  id="motorcycleId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("motorcycleId")}
                >
                  <option value="">Sélectionner une moto...</option>
                  {motorcycles.map(moto => (
                    <option key={moto.id} value={moto.id}>
                      {moto.brand} {moto.model} ({moto.licensePlate || moto.year})
                    </option>
                  ))}
                </select>
                {errors.motorcycleId && <p className="text-sm text-destructive">{errors.motorcycleId.message}</p>}
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type d'entretien *</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("type")}
                >
                  <option value="">Sélectionner le type...</option>
                  <option value="OIL_CHANGE">Vidange</option>
                  <option value="TIRE_CHANGE">Changement de pneu</option>
                  <option value="BRAKE_SERVICE">Entretien freins</option>
                  <option value="CHAIN_SERVICE">Kit chaîne</option>
                  <option value="GENERAL_SERVICE">Révision générale</option>
                  <option value="REPAIR">Réparation</option>
                  <option value="OTHER">Autre</option>
                </select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                {/* `max` bloque le sélecteur natif, le schéma bloque la saisie
                    manuelle et les requêtes directes vers l'API. */}
                <Input id="date" type="date" max={aujourdhui()} {...register("date")} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>

              {/* Mileage */}
              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage (km) *</Label>
                <Input
                  id="mileage"
                  type="number"
                  min={0}
                  aria-describedby={kmEnRetrait ? "mileage-indication" : undefined}
                  {...register("mileage")}
                />
                {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
                {/* Gris et non rouge : c'est une information, pas une erreur, et
                    le rouge de marque se confondrait avec les messages d'erreur. */}
                {kmEnRetrait && !errors.mileage && (
                  <p id="mileage-indication" className="text-sm text-muted-foreground">
                    Inférieur au kilométrage actuel de la moto (
                    {formatKm(motoSelectionnee!.currentMileage)} km). Le compteur de la moto
                    ne sera pas modifié.
                  </p>
                )}
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Coût total (€)</Label>
                <Input id="cost" type="number" step="0.01" min={0} {...register("cost")} />
                {errors.cost && <p className="text-sm text-destructive">{errors.cost.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="font-normal text-muted-foreground">(optionnel)</span>
                </Label>
                <textarea
                  id="description"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Pièces changées, atelier, remarques…"
                  {...register("description")}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => router.back()}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}

export default function AddMaintenancePage() {
  return (
    <Suspense
      fallback={
        <AppLayout title="Nouvelle intervention">
          <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </AppLayout>
      }
    >
      <AddMaintenanceContent />
    </Suspense>
  );
}
