import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AppLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen bg-muted/20">
      <nav className="bg-card border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <h1 className="font-bold text-xl text-primary">MotoTracker Pro</h1>
          <div className="hidden md:flex gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/garage" className="text-sm font-medium hover:text-primary transition-colors">My Garage</Link>
            <Link href="/maintenance" className="text-sm font-medium hover:text-primary transition-colors">Maintenances</Link>
          </div>
        </div>
        <div>
          <Button variant="ghost" asChild>
            <Link href="/api/auth/logout">Logout</Link>
          </Button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {children}
      </main>
    </div>
  );
}
