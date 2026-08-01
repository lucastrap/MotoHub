import * as z from "zod";
import { PLATE_REGEX } from "@/lib/formatPlate";

// ── Données de référence ──

export const BRANDS: { name: string }[] = [
  { name: "Yamaha" },
  { name: "Honda" },
  { name: "Kawasaki" },
  { name: "Suzuki" },
  { name: "BMW" },
  { name: "Ducati" },
  { name: "KTM" },
  { name: "Triumph" },
  { name: "Aprilia" },
  { name: "Husqvarna" },
  { name: "MV Agusta" },
  { name: "Beta" },
  { name: "Harley-Davidson" },
  { name: "Royal Enfield" },
  { name: "CFMoto" },
  { name: "Zontes" },
  { name: "Benelli" },
  { name: "Voge" },
  { name: "Kove" },
  { name: "QJ Motor" },
  { name: "Keeway" },
  { name: "Loncin" },
  { name: "Lifan" },
  { name: "Niu" },
  { name: "Kymco" },
  { name: "SYM" },
  { name: "Autre" },
];

export const COLORS = [
  { label: "Rouge", hex: "#DC2626" },
  { label: "Noir", hex: "#111111" },
  { label: "Blanc", hex: "#F5F5F5" },
  { label: "Bleu", hex: "#2563EB" },
  { label: "Vert", hex: "#16A34A" },
  { label: "Orange", hex: "#EA580C" },
  { label: "Jaune", hex: "#CA8A04" },
  { label: "Gris", hex: "#6B7280" },
  { label: "Argent", hex: "#CBD5E1" },
  { label: "Violet", hex: "#9333EA" },
];

/** Liste des années sélectionnables (de l'an prochain jusqu'à 1990). */
export function buildYears(currentYear: number = new Date().getFullYear()): number[] {
  return Array.from({ length: currentYear - 1989 + 2 }, (_, i) => currentYear + 1 - i);
}


import { buildMotorcycleSchema } from "@/lib/schemas/motorcycle";
export { buildMotorcycleSchema };

export const motorcycleWizardSchema = buildMotorcycleSchema();
export type MotorcycleFormValues = z.infer<typeof motorcycleWizardSchema>;

/** Champs à valider avant de passer à l'étape suivante, par étape. */
export const STEP_FIELDS: (keyof MotorcycleFormValues)[][] = [
  ["brand", "model", "year", "currentMileage"],
  ["color", "licensePlate", "vin"],
  ["purchaseDate", "purchasePrice"],
];

// ── Fonctions de validation / présentation (pures) ──

/** État de validité d'une plaque en cours de saisie : true/false/null (indéterminé). */
export function evaluatePlate(formatted: string): boolean | null {
  if (formatted.length === 0) return null;
  if (formatted.length === 9) return PLATE_REGEX.test(formatted);
  return null;
}

/** Indique si un modèle saisi figure dans la liste NHTSA (insensible à la casse). */
export function isKnownModel(value: string, models: string[]): boolean | null {
  if (!value || models.length === 0) return null;
  return models.some((m) => m.toLowerCase() === value.toLowerCase());
}

/** Filtre les suggestions de modèles selon la saisie (max `limit`). */
export function filterModels(models: string[], input: string, limit = 8): string[] {
  return models
    .filter((m) => m.toLowerCase().includes(input.toLowerCase()))
    .slice(0, limit);
}

/** Construit l'URL d'appel à l'API de modèles. */
export function buildModelsUrl(brand: string, year: number | string): string {
  return `/api/motorcycle-models?brand=${encodeURIComponent(brand)}&year=${year}`;
}

/**
 * Décide de l'effet de la touche Entrée dans le formulaire multi-étapes.
 *
 * Sans cette règle, Entrée dans un champ déclenche la soumission implicite via
 * le bouton submit de la dernière étape : on enregistrait la moto en tapant le
 * prix d'achat. Les boutons sont laissés de côté pour ne pas casser la
 * navigation au clavier (marques, couleurs, suggestions de modèle).
 */
export function enterAction(
  tagName: string,
  step: number,
  lastStep: number,
): "ignore" | "next" | "block" {
  if (tagName !== "INPUT" && tagName !== "SELECT") return "ignore";
  return step < lastStep ? "next" : "block";
}

/** Transforme le corps d'une erreur API en message lisible. */
export function parseSubmitError(body: unknown, status: number): string {
  const err = (body as { error?: unknown })?.error;
  if (Array.isArray(err)) {
    return err.map((e: { message?: string }) => e.message).join(", ");
  }
  return typeof err === "string" ? err : `Erreur ${status}`;
}
