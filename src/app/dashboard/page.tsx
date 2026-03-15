"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Motorcycle } from "@prisma/client";

export default function DashboardPage() {
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/motorcycles");
        if (res.ok) {
          const data = await res.json();
          setMotorcycles(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <AppLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Motorcycles</h3>
          <p className="text-4xl font-bold">{loading ? "-" : motorcycles.length}</p>
        </div>
        
        <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Maintenance Cost</h3>
          <p className="text-4xl font-bold">€0.00</p>
          <span className="text-xs text-muted-foreground mt-1">Pending maintenance API</span>
        </div>
        
        <div className="p-6 bg-card rounded-xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Upcoming Reminders</h3>
          <p className="text-4xl font-bold text-primary">0</p>
          <span className="text-xs text-muted-foreground mt-1">Pending reminders API</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Maintenance Activity</h3>
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No recent activity recorded.</p>
          </div>
        </div>

        <div className="p-6 bg-card rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4">Your Garage</h3>
          {loading ? (
             <p className="text-sm text-muted-foreground">Loading...</p>
          ) : motorcycles.length === 0 ? (
             <p className="text-sm text-muted-foreground">No motorcycles added yet.</p>
          ) : (
            <div className="space-y-4">
              {motorcycles.slice(0, 3).map((moto) => (
                <div key={moto.id} className="flex justify-between items-center bg-muted/30 p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{moto.brand} {moto.model}</p>
                    <p className="text-xs text-muted-foreground">{moto.year}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{moto.currentMileage} km</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
