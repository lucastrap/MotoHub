import * as z from "zod";

export const MAINTENANCE_TYPES = [
  "OIL_CHANGE",
  "TIRE_CHANGE",
  "BRAKE_SERVICE",
  "CHAIN_SERVICE",
  "GENERAL_SERVICE",
  "REPAIR",
  "OTHER",
] as const;

/** Kilométrage au-delà duquel la saisie est presque sûrement une erreur. */
export const KM_MAX = 999_999;

/** Date du jour au format `YYYY-MM-DD`, dans le fuseau local. */
export function aujourdhui(date: Date = new Date()): string {
  const decalage = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - decalage).toISOString().slice(0, 10);
}

/**
 * Schéma d'une intervention, partagé par le formulaire et l'API pour que les
 * deux appliquent exactement les mêmes règles.
 *
 * `limite` est la date maximale acceptée : une intervention ne peut pas avoir
 * eu lieu demain.
 */
export function buildMaintenanceSchema(limite: string = aujourdhui()) {
  return z.object({
    motorcycleId: z.string().uuid({ message: "Veuillez sélectionner une moto" }),
    type: z.enum(MAINTENANCE_TYPES, {
      required_error: "Veuillez sélectionner un type d'entretien",
      invalid_type_error: "Type d'entretien inconnu",
    }),
    date: z
      .string()
      .min(1, "La date est requise")
      .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide")
      .refine((v) => v <= limite, "La date ne peut pas être dans le futur"),
    mileage: z.coerce
      .number({ invalid_type_error: "Le kilométrage doit être un nombre" })
      .int("Le kilométrage doit être un nombre entier")
      .min(0, "Le kilométrage ne peut pas être négatif")
      .max(KM_MAX, `Le kilométrage semble erroné (maximum ${KM_MAX})`),
    // Le champ vide doit rester « non renseigné » et non zéro : sans ce
    // pretraitement, z.coerce.number() convertit "" en 0 et le carnet affiche
    // un cout de 0 EUR pour une intervention dont le prix est inconnu.
    cost: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
      z
        .number({ invalid_type_error: "Le coût doit être un nombre" })
        .min(0, "Le coût ne peut pas être négatif")
        .optional(),
    ),
    description: z.string().optional().default(""),
  });
}

export const maintenanceSchema = buildMaintenanceSchema();
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
