import * as z from "zod";
import { PLATE_REGEX } from "@/lib/formatPlate";


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

export const motorcycleSchema = buildMotorcycleSchema();
export type MotorcycleInput = z.infer<typeof motorcycleSchema>;
