import * as z from "zod";
import { PLATE_REGEX } from "@/lib/formatPlate";
import { KM_MAX, aujourdhui } from "@/lib/schemas/maintenance";

/** Première année de mise en circulation acceptée. */
export const ANNEE_MIN = 1990;

export function buildMotorcycleSchema(
  currentYear: number = new Date().getFullYear(),
  limiteDate: string = aujourdhui(),
) {
  return z.object({
    brand: z.string().min(1, "La marque est requise"),
    model: z.string().min(1, "Le modèle est requis"),
    year: z.coerce
      .number({ invalid_type_error: "L'année doit être un nombre" })
      .int("L'année doit être un nombre entier")
      .min(ANNEE_MIN, `L'année doit être postérieure à ${ANNEE_MIN}`)
      // Le millésime suivant est admis : les modèles sortent en avance.
      .max(currentYear + 1, `L'année ne peut pas dépasser ${currentYear + 1}`),
    currentMileage: z.coerce
      .number({ invalid_type_error: "Le kilométrage doit être un nombre" })
      .int("Le kilométrage doit être un nombre entier")
      .min(0, "Le kilométrage ne peut pas être négatif")
      .max(KM_MAX, `Le kilométrage semble erroné (maximum ${KM_MAX})`)
      .default(0),
    color: z.string().optional(),
    licensePlate: z
      .string()
      .optional()
      .transform((v) => v || undefined)
      .refine((v) => !v || PLATE_REGEX.test(v), "Format invalide (ex: AB-123-CD)"),
    vin: z
      .string()
      .optional()
      .transform((v) => v || undefined)
      .refine((v) => !v || v.length === 17, "Un numéro de série comporte 17 caractères"),
    purchaseDate: z
      .string()
      .optional()
      .transform((v) => v || undefined)
      .refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide")
      .refine((v) => !v || v <= limiteDate, "La date d'achat ne peut pas être dans le futur"),
    purchasePrice: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z
        .number({ invalid_type_error: "Le prix doit être un nombre" })
        .min(0, "Le prix ne peut pas être négatif")
        .optional(),
    ),
    photoUrl: z
      .string()
      .optional()
      .transform((v) => v || undefined)
      .refine((v) => !v || /^https:\/\//.test(v), "URL de photo invalide"),
  });
}

export const motorcycleSchema = buildMotorcycleSchema();
export type MotorcycleInput = z.infer<typeof motorcycleSchema>;
