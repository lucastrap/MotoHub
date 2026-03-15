"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/layout/AppLayout";
import { Motorcycle } from "@prisma/client";

const maintenanceSchema = z.object({
  motorcycleId: z.string().min(1, { message: "Veuillez sélectionner une moto" }),
  type: z.enum([
    "OIL_CHANGE", 
    "TIRE_CHANGE", 
    "BRAKE_SERVICE", 
    "CHAIN_SERVICE", 
    "GENERAL_SERVICE", 
    "REPAIR", 
    "OTHER"
  ], { required_error: "Veuillez sélectionner un type d'entretien" }),
  date: z.string().min(1, { message: "La date est requise" }),
  mileage: z.coerce.number().min(0),
  description: z.string().min(1, { message: "La description est requise" }),
  cost: z.coerce.number().optional()
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

export default function AddMaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultMotoId = searchParams.get("motoId");

  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      motorcycleId: defaultMotoId || "",
      date: new Date().toISOString().split('T')[0],
      mileage: 0,
    }
  });

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
    <AppLayout title="Prochain entretien">
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
                <Input id="date" type="date" {...register("date")} />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>

              {/* Mileage */}
              <div className="space-y-2">
                <Label htmlFor="mileage">Kilométrage (km) *</Label>
                <Input id="mileage" type="number" {...register("mileage")} />
                {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Coût total (€)</Label>
                <Input id="cost" type="number" step="0.01" {...register("cost")} />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description / Notes *</Label>
                <textarea
                  id="description"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Détails de l'intervention..."
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
