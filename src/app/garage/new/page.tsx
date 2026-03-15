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
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
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
        throw new Error("Failed to add motorcycle");
      }

      router.push("/garage");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AppLayout title="Add New Motorcycle">
      <div className="bg-card rounded-xl border p-6 md:p-8 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input id="brand" placeholder="e.g. Yamaha" {...register("brand")} />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" placeholder="e.g. MT-07" {...register("model")} />
              {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Input id="year" type="number" {...register("year")} />
              {errors.year && <p className="text-sm text-destructive">{errors.year.message}</p>}
            </div>

            {/* Current Mileage */}
            <div className="space-y-2">
              <Label htmlFor="currentMileage">Current Mileage (km) *</Label>
              <Input id="currentMileage" type="number" {...register("currentMileage")} />
              {errors.currentMileage && <p className="text-sm text-destructive">{errors.currentMileage.message}</p>}
            </div>

            {/* License Plate */}
            <div className="space-y-2">
              <Label htmlFor="licensePlate">License Plate</Label>
              <Input id="licensePlate" placeholder="e.g. AB-123-CD" {...register("licensePlate")} />
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" placeholder="e.g. Blue" {...register("color")} />
            </div>

            {/* VIN */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
              <Input id="vin" placeholder="17-character VIN" {...register("vin")} />
            </div>

            {/* Purchase Date */}
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
            </div>

            {/* Purchase Price */}
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (€)</Label>
              <Input id="purchasePrice" type="number" step="0.01" {...register("purchasePrice")} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Motorcycle"}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
