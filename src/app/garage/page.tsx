"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Motorcycle } from "@prisma/client";

export default function GaragePage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AppLayout title="My Garage">
      <div className="mb-6">
        <Button asChild>
          <Link href="/garage/new">Add Motorcycle</Link>
        </Button>
      </div>

      {loading ? (
        <p>Loading your garage...</p>
      ) : motorcycles.length === 0 ? (
        <div className="text-center p-12 bg-card rounded-xl border border-dashed">
          <h3 className="text-lg font-medium mb-2">No motorcycles yet</h3>
          <p className="text-muted-foreground mb-4">Add your first motorcycle to start tracking its maintenance.</p>
          <Button asChild variant="outline">
            <Link href="/garage/new">Add Motorcycle</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {motorcycles.map((moto) => (
            <div key={moto.id} className="bg-card rounded-xl border p-6 shadow-sm flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold">{moto.brand} {moto.model}</h3>
                <p className="text-muted-foreground">{moto.year}</p>
              </div>
              <div className="space-y-2 mt-auto text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mileage</span>
                  <span className="font-medium">{moto.currentMileage.toLocaleString()} km</span>
                </div>
                {moto.licensePlate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License Plate</span>
                    <span className="font-medium uppercase">{moto.licensePlate}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/garage/${moto.id}`}>Details</Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/maintenance?motoId=${moto.id}`}>Log Service</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
