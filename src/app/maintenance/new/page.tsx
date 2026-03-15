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
  motorcycleId: z.string().min(1, { message: "Please select a motorcycle" }),
  type: z.enum([
    "OIL_CHANGE", 
    "TIRE_CHANGE", 
    "BRAKE_SERVICE", 
    "CHAIN_SERVICE", 
    "GENERAL_SERVICE", 
    "REPAIR", 
    "OTHER"
  ], { required_error: "Please select a maintenance type" }),
  date: z.string().min(1, { message: "Date is required" }),
  mileage: z.coerce.number().min(0),
  description: z.string().min(1, { message: "Description is required" }),
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
        throw new Error("Failed to log maintenance");
      }

      router.push("/maintenance");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AppLayout title="Log Maintenance Service">
      <div className="bg-card rounded-xl border p-6 md:p-8 max-w-2xl shadow-sm">
        {loading ? (
          <p>Loading your garage...</p>
        ) : motorcycles.length === 0 ? (
          <div className="text-center py-8">
            <p className="mb-4">You need to add a motorcycle first before logging maintenance.</p>
            <Button onClick={() => router.push("/garage/new")}>Add Motorcycle</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Motorcycle Selection */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="motorcycleId">Motorcycle *</Label>
                <select
                  id="motorcycleId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("motorcycleId")}
                >
                  <option value="">Select a motorcycle...</option>
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
                <Label htmlFor="type">Service Type *</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("type")}
                >
                  <option value="">Select type...</option>
                  <option value="OIL_CHANGE">Oil Change</option>
                  <option value="TIRE_CHANGE">Tire Change</option>
                  <option value="BRAKE_SERVICE">Brake Service</option>
                  <option value="CHAIN_SERVICE">Chain Service</option>
                  <option value="GENERAL_SERVICE">General Service</option>
                  <option value="REPAIR">Repair</option>
                  <option value="OTHER">Other</option>
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
                <Label htmlFor="mileage">Mileage at Service (km) *</Label>
                <Input id="mileage" type="number" {...register("mileage")} />
                {errors.mileage && <p className="text-sm text-destructive">{errors.mileage.message}</p>}
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Total Cost (€)</Label>
                <Input id="cost" type="number" step="0.01" {...register("cost")} />
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description / Notes *</Label>
                <textarea
                  id="description"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Details about the service performed..."
                  {...register("description")}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

            </div>

            {error && <p className="text-sm text-destructive font-medium">{error}</p>}

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Log Maintenance"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
