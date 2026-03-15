"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLayout } from "@/components/layout/AppLayout";

const motorcycleSchema = z.object({
  brand: z.string().min(1, { message: "La marque est requise" }),
  model: z.string().min(1, { message: "Le modèle est requis" }),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
  vin: z.string().optional(),
  licensePlate: z.string().optional(),
  currentMileage: z.coerce.number().min(0).default(0),
  purchaseDate: z.string().optional(),
  purchasePrice: z.coerce.number().optional(),
});

type MotorcycleFormValues = z.infer<typeof motorcycleSchema>;

export default function AddMotorcyclePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MotorcycleFormValues>({
    resolver: zodResolver(motorcycleSchema),
    defaultValues: {
      currentMileage: 0,
      year: new Date().getFullYear(),
    }
  });

  async function onSubmit(data: MotorcycleFormValues) {
    setError(null);
    try {
      const response = await fetch("/api/motorcycles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Échec de l'ajout de la moto");
      }

      router.push("/garage");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AppLayout title="Ajouter une nouvelle moto">
      <div className="bg-card rounded-xl border p-6 md:p-8 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">Marque *</Label>
              <Input id="brand" placeholder="ex. Honda" {...register("brand")} />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Modèle *</Label>
              <Input id="model" placeholder="ex. CBR600RR" {...register("model")} />
              {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Année *</Label>
              <Input id="year" type="number" {...register("year")} />
              {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
            </div>

            {/* Current Mileage */}
            <div className="space-y-2">
              <Label htmlFor="currentMileage">Kilométrage actuel (km) *</Label>
              <Input id="currentMileage" type="number" {...register("currentMileage")} />
              {errors.currentMileage && <p className="text-sm text-destructive">{errors.currentMileage.message}</p>}
            </div>

            {/* License Plate */}
            <div className="space-y-2">
              <Label htmlFor="licensePlate">Immatriculation</Label>
              <Input id="licensePlate" placeholder="ex. AB-123-CD" {...register("licensePlate")} />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Couleur</Label>
              <Input id="color" placeholder="ex. Rouge" {...register("color")} />
            </div>

            {/* VIN */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vin">Numéro de série (VIN)</Label>
              <Input id="vin" placeholder="17 caractères" {...register("vin")} />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Date d'achat</Label>
              <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Prix d'achat (€)</Label>
              <Input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer la moto"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
