import * as z from "zod";

// Schéma extrait de src/app/garage/new/page.tsx
const currentYear = new Date().getFullYear();

const schema = z.object({
  brand: z.string().min(1, "La marque est requise"),
  model: z.string().min(1, "Le modèle est requis"),
  year: z.coerce.number().min(1990).max(currentYear + 1),
  currentMileage: z.coerce.number().min(0).default(0),
  color: z.string().optional(),
  licensePlate: z
    .string()
    .optional()
    .transform((v) => v || undefined)
    .refine(
      (v) => !v || /^[A-Z]{2}-\d{3}-[A-Z]{2}$/.test(v),
      "Format invalide (ex: AB-123-CD)"
    ),
  vin: z.string().optional().transform((v) => v || undefined),
  purchaseDate: z.string().optional().transform((v) => v || undefined),
  purchasePrice: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().positive().optional()
  ),
});

describe("Schéma Zod — ajout de moto", () => {
  const validBase = {
    brand: "Yamaha",
    model: "MT-07",
    year: 2022,
    currentMileage: 12500,
  };

  it("accepte des données valides minimales", () => {
    expect(() => schema.parse(validBase)).not.toThrow();
  });

  it("accepte un formulaire complet valide", () => {
    expect(() =>
      schema.parse({
        ...validBase,
        color: "Rouge",
        licensePlate: "AB-123-CD",
        vin: "JKAZX4R14XA000001",
        purchaseDate: "2022-06-15",
        purchasePrice: 8500,
      })
    ).not.toThrow();
  });

  it("rejette si la marque est vide", () => {
    expect(() => schema.parse({ ...validBase, brand: "" })).toThrow();
  });

  it("rejette si le modèle est vide", () => {
    expect(() => schema.parse({ ...validBase, model: "" })).toThrow();
  });

  it("rejette une année inférieure à 1990", () => {
    expect(() => schema.parse({ ...validBase, year: 1985 })).toThrow();
  });

  it("rejette un kilométrage négatif", () => {
    expect(() => schema.parse({ ...validBase, currentMileage: -1 })).toThrow();
  });

  it("rejette une immatriculation hors format SIV", () => {
    expect(() =>
      schema.parse({ ...validBase, licensePlate: "123ABC" })
    ).toThrow();
  });

  it("accepte une immatriculation vide (champ optionnel)", () => {
    const result = schema.parse({ ...validBase, licensePlate: "" });
    expect(result.licensePlate).toBeUndefined();
  });

  it("accepte un VIN vide (champ optionnel)", () => {
    const result = schema.parse({ ...validBase, vin: "" });
    expect(result.vin).toBeUndefined();
  });

  it("accepte un prix vide sans erreur", () => {
    const result = schema.parse({ ...validBase, purchasePrice: "" });
    expect(result.purchasePrice).toBeUndefined();
  });

  it("rejette un prix d'achat négatif", () => {
    expect(() =>
      schema.parse({ ...validBase, purchasePrice: -500 })
    ).toThrow();
  });

  it("coerce correctement le kilométrage depuis une chaîne", () => {
    const result = schema.parse({ ...validBase, currentMileage: "12500" });
    expect(result.currentMileage).toBe(12500);
  });
});
