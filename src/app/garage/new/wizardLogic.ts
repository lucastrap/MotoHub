import * as z from "zod";
import { PLATE_REGEX } from "@/lib/formatPlate";

// ── Données de référence ──

export const BRANDS: { name: string; origin?: string }[] = [
  { name: "Yamaha", origin: "🇯🇵" },
  { name: "Honda", origin: "🇯🇵" },
  { name: "Kawasaki", origin: "🇯🇵" },
  { name: "Suzuki", origin: "🇯🇵" },
  { name: "BMW", origin: "🇩🇪" },
  { name: "Ducati", origin: "🇮🇹" },
  { name: "KTM", origin: "🇦🇹" },
  { name: "Triumph", origin: "🇬🇧" },
  { name: "Aprilia", origin: "🇮🇹" },
  { name: "Husqvarna", origin: "🇦🇹" },
  { name: "MV Agusta", origin: "🇮🇹" },
  { name: "Beta", origin: "🇮🇹" },
  { name: "Harley-Davidson", origin: "🇺🇸" },
  { name: "Royal Enfield", origin: "🇮🇳" },
  { name: "CFMoto", origin: "🇨🇳" },
  { name: "Zontes", origin: "🇨🇳" },
  { name: "Benelli", origin: "🇨🇳" },
  { name: "Voge", origin: "🇨🇳" },
  { name: "Kove", origin: "🇨🇳" },
  { name: "QJ Motor", origin: "🇨🇳" },
  { name: "Keeway", origin: "🇨🇳" },
  { name: "Loncin", origin: "🇨🇳" },
  { name: "Lifan", origin: "🇨🇳" },
  { name: "Niu", origin: "🇨🇳" },
  { name: "Kymco", origin: "🇹🇼" },
  { name: "SYM", origin: "🇹🇼" },
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

// ── Schéma de validation ──

export function buildMotorcycleSchema(currentYear: number = new Date().getFullYear()) {
  return z.object({
    brand: z.string().min(1, "La marque est requise"),
    model: z.string().min(1, "Le modèle est requis"),
    year: z.coerce.number().min(1990).max(currentYear + 1),
    currentMileage: z.coerce.number().min(0).default(0),
    color: z.string().optional(),
    licensePlate: z
      .string()
      .optional()
      .transform((v) => v || undefined)
      .refine((v) => !v || PLATE_REGEX.test(v), "Format invalide (ex: AB-123-CD)"),
    vin: z.string().optional().transform((v) => v || undefined),
    purchaseDate: z.string().optional().transform((v) => v || undefined),
    purchasePrice: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z.number().positive().optional()
    ),
  });
}

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

/** Transforme le corps d'une erreur API en message lisible. */
export function parseSubmitError(body: unknown, status: number): string {
  const err = (body as { error?: unknown })?.error;
  if (Array.isArray(err)) {
    return err.map((e: { message?: string }) => e.message).join(", ");
  }
  return typeof err === "string" ? err : `Erreur ${status}`;
}
